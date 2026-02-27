import { PrismaClient } from '@prisma/client';
import { SaleRepository, SaleWithDetails, SaleWithItemCount } from './sale.repo.js';
import {
  CreateSaleDto,
  SaleResponse,
  SaleListItem,
  SaleListResponse,
  SaleDetailResponse,
} from './sale.dtos.js';
import { NotFoundError, BadRequestError } from '@/common/exceptions/app-error.js';
import { MSG } from '@/common/constants/messages.vi.js';

// ─── Mapper helpers ────────────────────────────────────────────────────────────

function toSaleDetailResponse(detail: any): SaleDetailResponse {
  return {
    id: detail.id,
    saleId: detail.saleId,
    productId: detail.productId,
    quantity: detail.quantity,
    sellPrice: Number(detail.sellPrice),
    profit: Number(detail.profit),
    product: {
      id: detail.product.id,
      code: detail.product.code,
      name: detail.product.name,
      unit: detail.product.unit,
    },
  };
}

function toSaleResponse(sale: SaleWithDetails): SaleResponse {
  return {
    id: sale.id,
    saleDate: sale.saleDate,
    totalAmount: Number(sale.totalAmount),
    totalProfit: Number(sale.totalProfit),
    createdAt: sale.createdAt,
    updatedAt: sale.updatedAt,
    details: sale.details.map(toSaleDetailResponse),
  };
}

function toSaleListItem(sale: SaleWithItemCount): SaleListItem {
  return {
    id: sale.id,
    saleDate: sale.saleDate,
    totalAmount: Number(sale.totalAmount),
    totalProfit: Number(sale.totalProfit),
    createdAt: sale.createdAt,
    itemCount: sale._count.details,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Sale Service - Orchestrates all sale business logic including the
 * multi-step atomic transaction (FR-08 through FR-13).
 */
export class SaleService {
  constructor(
    private readonly saleRepo: SaleRepository,
    private readonly prisma: PrismaClient,
  ) {}

  /**
   * Return a paginated list of sales (slim view, newest first).
   */
  async getSales(params: {
    page?: number;
    limit?: number;
  }): Promise<SaleListResponse> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const skip = (page - 1) * limit;

    const { sales, total } = await this.saleRepo.findAll({ skip, take: limit });

    return {
      data: sales.map(toSaleListItem),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Return the full details of a single sale invoice (FR-08, FR-09).
   */
  async getSaleById(id: string): Promise<SaleResponse> {
    const sale = await this.saleRepo.findById(id);
    if (!sale) {
      throw new NotFoundError(MSG.SALE.NOT_FOUND);
    }
    return toSaleResponse(sale);
  }

  /**
   * Create a new sale invoice.
   *
   * Transaction flow (all steps are atomic — FR-08 through FR-13):
   *
   *  Step 1 – Read current product data inside the transaction so we operate
   *            on consistent, up-to-date stockQty and prices.
   *
   *  Step 2 – Validate IDs: every requested productId must resolve to a real product.
   *
   *  Step 3 – Validate stock (FR-11): if ANY product has stockQty < requested quantity,
   *            abort and throw HTTP 400.
   *
   *  Step 4 – Calculate financials (FR-12, FR-13):
   *            lineProfit  = (sellPrice - costPrice) * quantity
   *            totalAmount = Σ sellPrice * quantity
   *            totalProfit = Σ lineProfit
   *
   *  Step 5 – Persist (within the same tx):
   *            a. Deduct stockQty for each product (FR-10)
   *            b. INSERT Sale header (totalAmount, totalProfit)
   *            c. INSERT all SaleDetail rows
   */
  async createSale(dto: CreateSaleDto): Promise<SaleResponse> {
    const createdSaleId = await this.prisma.$transaction(async (tx) => {
      // ── Step 1: Fetch products inside the transaction ──────────────────────
      const productIds = dto.items.map((i) => i.productId);
      const products = await this.saleRepo.findProductsForSale(productIds, tx);

      // ── Step 2: Validate all product IDs exist ─────────────────────────────
      const productMap = new Map(products.map((p) => [p.id, p]));
      for (const item of dto.items) {
        if (!productMap.has(item.productId)) {
          throw new NotFoundError(
            `${MSG.PRODUCT.NOT_FOUND}: ${item.productId}`,
          );
        }
      }

      // ── Step 3: Stock constraint check (FR-11) ─────────────────────────────
      // Aggregate requested quantities per productId to handle duplicate entries
      const requestedQtyMap = new Map<string, number>();
      for (const item of dto.items) {
        requestedQtyMap.set(
          item.productId,
          (requestedQtyMap.get(item.productId) ?? 0) + item.quantity,
        );
      }

      for (const [productId, requestedQty] of requestedQtyMap) {
        const product = productMap.get(productId)!;
        if (product.stockQty < requestedQty) {
          throw new BadRequestError(
            `${MSG.SALE.INSUFFICIENT_STOCK}: "${product.name}" ` +
              `(tồn kho: ${product.stockQty}, yêu cầu: ${requestedQty})`,
          );
        }
      }

      // ── Step 4: Calculate financials (FR-12, FR-13) ────────────────────────
      let totalAmount = 0;
      let totalProfit = 0;

      const lineItems = dto.items.map((item) => {
        const product = productMap.get(item.productId)!;
        const sellPrice = Number(product.sellPrice);
        const costPrice = Number(product.costPrice);

        const lineAmount = sellPrice * item.quantity;
        const lineProfit = (sellPrice - costPrice) * item.quantity;

        totalAmount += lineAmount;
        totalProfit += lineProfit;

        return {
          productId: item.productId,
          quantity: item.quantity,
          sellPrice,
          profit: lineProfit,
        };
      });

      // ── Step 5a: Deduct stock for each product (FR-10) ─────────────────────
      // Use the aggregated quantities to handle duplicate productIds correctly
      for (const [productId, qty] of requestedQtyMap) {
        await this.saleRepo.deductProductStock(productId, qty, tx);
      }

      // ── Step 5b: Create Sale header ────────────────────────────────────────
      const sale = await this.saleRepo.createSale(
        {
          saleDate: dto.saleDate,
          totalAmount,
          totalProfit,
        },
        tx,
      );

      // ── Step 5c: Create all SaleDetail rows ────────────────────────────────
      await this.saleRepo.createSaleDetails(sale.id, lineItems, tx);

      return sale.id;
    });

    // Re-fetch with full relations outside the transaction for the response
    const fullSale = await this.saleRepo.findById(createdSaleId);
    return toSaleResponse(fullSale!);
  }
}
