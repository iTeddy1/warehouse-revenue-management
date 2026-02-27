import { http, HttpResponse } from 'msw'

// Mock data
const mockProject = {
  id: 'test-project-1',
  code: 'CT-2025-TEST',
  name: 'Trường mầm non ABC',
  investor: 'Phòng GD&ĐT Test',
  location: 'Quận Test, TP.HCM',
  status: 'đang thi công',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  warehouse: {
    id: 'test-warehouse-1',
    name: 'Kho Trường mầm non ABC',
    location: 'Quận Test, TP.HCM',
    description: 'Kho chính cho dự án Trường mầm non ABC',
  },
}

const mockContract = {
  id: 'test-contract-1',
  projectId: 'test-project-1',
  contractNumber: 'HD-TEST-001',
  contractName: 'Hợp đồng thi công Trường mầm non ABC',
  contractorName: 'Công ty XYZ',
  contractValue: 5000000000,
  status: 'active',
  addendums: [
    {
      id: 'test-addendum-1',
      name: 'Phụ lục 01 - Thay đổi thiết kế',
      valueChange: 500000000,
      type: 'increase',
    },
  ],
}

const mockPayment = {
  id: 'test-payment-1',
  projectId: 'test-project-1',
  seqNo: 1,
  description: 'Thanh toán vật tư xi măng PCB40',
  companyName: 'Công ty TNHH Vật liệu XD ABC',
  requestedBy: 'Nguyễn Văn A',
  subTotal: 18000000,
  tax: 1800000,
  total: 19800000,
  status: 'draft',
  items: [
    {
      id: 'test-item-1',
      name: 'Xi măng PCB40',
      quantity: 100,
      unitPrice: 180000,
      amount: 18000000,
      unit: 'bao',
    },
  ],
}

const mockContinuousReport = {
  projectId: 'test-project-1',
  projectCode: 'CT-2025-TEST',
  projectName: 'Trường mầm non ABC',
  projectStatus: 'đang thi công',
  isFrozen: false,
  contractValue: 5000000000,
  totalIncreaseAddendum: 500000000,
  totalDecreaseAddendum: 0,
  currentContractValue: 5500000000,
  totalApprovedExpenses: 19800000,
  revenueExpenseDifference: 5480200000,
  expenseToRevenueRatio: 0.0036,
  totalMaterialValue: 18000000,
  materialAlerts: [],
  contractAlerts: [],
}

// Project handlers
export const mockProjectHandlers = [
  http.get('http://localhost:4000/api/projects', () => {
    return HttpResponse.json({
      success: true,
      data: [mockProject],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    })
  }),

  http.post('http://localhost:4000/api/projects', async ({ request }) => {
    const body = (await request.json()) as any
    return HttpResponse.json(
      {
        success: true,
        data: {
          ...mockProject,
          ...body,
          id: 'test-project-new',
        },
      },
      { status: 201 },
    )
  }),

  http.get('http://localhost:4000/api/projects/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: mockProject,
    })
  }),

  http.get('http://localhost:4000/api/projects/:id/stats', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        totalContracts: 1,
        totalContractValue: 5500000000,
        totalPayments: 19800000,
        totalMaterials: 18000000,
      },
    })
  }),
]

// Contract handlers
export const mockContractHandlers = [
  // Project-scoped contracts (from projects.routes.ts)
  http.get('http://localhost:4000/api/projects/:projectId/contracts', () => {
    return HttpResponse.json({
      success: true,
      data: [mockContract],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    })
  }),

  http.post(
    'http://localhost:4000/api/projects/:projectId/contracts',
    async ({ request }) => {
      const body = (await request.json()) as any
      return HttpResponse.json(
        {
          success: true,
          data: {
            ...mockContract,
            ...body,
            id: 'test-contract-new',
          },
        },
        { status: 201 },
      )
    },
  ),

  http.get(
    'http://localhost:4000/api/projects/:projectId/contract-summary',
    ({ params }) => {
      return HttpResponse.json({
        success: true,
        data: {
          totalContracts: 1,
          totalOriginalValue: 5000000000,
          totalCurrentValue: 5500000000,
          totalAddendums: 1,
        },
      })
    },
  ),

  // Individual contract routes (from contract.routes.ts)
  http.get('http://localhost:4000/api/contracts', () => {
    return HttpResponse.json({
      success: true,
      data: [mockContract],
    })
  }),

  http.get('http://localhost:4000/api/contracts/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: mockContract,
    })
  }),

  // Contract addendums
  http.get(
    'http://localhost:4000/api/contracts/:contractId/addendums',
    ({ params }) => {
      return HttpResponse.json({
        success: true,
        data: mockContract.addendums,
      })
    },
  ),

  http.post(
    'http://localhost:4000/api/contracts/:contractId/addendums',
    async ({ request }) => {
      const body = (await request.json()) as any
      return HttpResponse.json(
        {
          success: true,
          data: {
            id: 'test-addendum-new',
            ...body,
          },
        },
        { status: 201 },
      )
    },
  ),

  http.get(
    'http://localhost:4000/api/contracts/:contractId/addendums/:addendumId',
    ({ params }) => {
      return HttpResponse.json({
        success: true,
        data: mockContract.addendums[0],
      })
    },
  ),
]

// Payment handlers
export const mockPaymentHandlers = [
  http.get('http://localhost:4000/api/payments', () => {
    return HttpResponse.json({
      success: true,
      data: [mockPayment],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    })
  }),

  http.post('http://localhost:4000/api/payments', async ({ request }) => {
    const body = (await request.json()) as any
    return HttpResponse.json(
      {
        success: true,
        data: {
          ...mockPayment,
          ...body,
          id: 'test-payment-new',
        },
      },
      { status: 201 },
    )
  }),

  http.get('http://localhost:4000/api/payments/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: mockPayment,
    })
  }),

  http.put('http://localhost:4000/api/payments/:id', async ({ request }) => {
    const body = (await request.json()) as any
    return HttpResponse.json({
      success: true,
      data: {
        ...mockPayment,
        ...body,
      },
    })
  }),

  http.delete('http://localhost:4000/api/payments/:id', () => {
    return HttpResponse.json({
      success: true,
      message: 'Payment deleted successfully',
    })
  }),
]

// Reports handlers
export const mockReportsHandlers = [
  // Continuous project report
  http.get(
    'http://localhost:4000/api/reports/projects/:projectId/continuous',
    ({ params }) => {
      return HttpResponse.json({
        success: true,
        data: mockContinuousReport,
      })
    },
  ),

  // Finance report summary
  http.get('http://localhost:4000/api/reports/finance-summary', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          projectId: mockProject.id,
          projectCode: mockProject.code,
          projectName: mockProject.name,
          projectStatus: mockProject.status,
          totalContractValue: 5500000000,
          totalExpenses: 19800000,
          balance: 5480200000,
        },
      ],
    })
  }),

  // Project reports
  http.get('http://localhost:4000/api/reports/projects', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          projectId: mockProject.id,
          projectCode: mockProject.code,
          projectName: mockProject.name,
          projectStatus: mockProject.status,
          totalContractValue: 5500000000,
          totalExpenses: 19800000,
          materialCost: 18000000,
          balance: 5480200000,
        },
      ],
    })
  }),

  // Refresh cache
  http.post('http://localhost:4000/api/reports/refresh-cache', () => {
    return HttpResponse.json({
      success: true,
      message: 'Cache refreshed successfully',
    })
  }),
]

// Material entry handlers
export const mockMaterialEntryHandlers = [
  http.get('http://localhost:4000/api/material-entries', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'test-material-entry-1',
          warehouseId: 'test-warehouse-1',
          materialName: 'Xi măng PCB40',
          quantity: 100,
          unit: 'bao',
          unitPrice: 180000,
          totalValue: 18000000,
          entryDate: '2025-01-15',
          status: 'recorded',
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    })
  }),

  http.post(
    'http://localhost:4000/api/material-entries',
    async ({ request }) => {
      const body = (await request.json()) as any
      return HttpResponse.json(
        {
          success: true,
          data: {
            id: 'test-material-entry-new',
            ...body,
            status: 'draft',
          },
        },
        { status: 201 },
      )
    },
  ),

  http.get('http://localhost:4000/api/material-entries/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        warehouseId: 'test-warehouse-1',
        materialName: 'Xi măng PCB40',
        quantity: 100,
        unit: 'bao',
        unitPrice: 180000,
        totalValue: 18000000,
        status: 'recorded',
      },
    })
  }),
]

// Warehouse handlers
export const mockWarehouseHandlers = [
  http.get('http://localhost:4000/api/warehouses', () => {
    return HttpResponse.json({
      success: true,
      data: [mockProject.warehouse],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    })
  }),

  http.get('http://localhost:4000/api/warehouses/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: mockProject.warehouse,
    })
  }),

  http.get('http://localhost:4000/api/warehouses/:id/stats', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        totalMaterials: 1,
        totalValue: 18000000,
        lowStockItems: 0,
      },
    })
  }),

  http.post('http://localhost:4000/api/warehouses', async ({ request }) => {
    const body = (await request.json()) as any
    return HttpResponse.json(
      {
        success: true,
        data: {
          id: 'test-warehouse-new',
          ...body,
        },
      },
      { status: 201 },
    )
  }),
]
