// Import construction management handlers
import {
  mockContractHandlers,
  mockMaterialEntryHandlers,
  mockPaymentHandlers,
  mockProjectHandlers,
  mockReportsHandlers,
  mockWarehouseHandlers,
} from './userFlowHandlers'

export const handlers = [
  // Include all construction management handlers
  ...mockProjectHandlers,
  ...mockContractHandlers,
  ...mockPaymentHandlers,
  ...mockReportsHandlers,
  ...mockMaterialEntryHandlers,
  ...mockWarehouseHandlers,
]
