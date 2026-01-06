import type { FlatsResponseDto, FlatDto } from "../types";
import { formatCurrency } from "./utils";

/**
 * Enhanced flat view model for list view
 */
export interface FlatCardViewModel {
  id: string;
  name: string;
  address: string;
  tenantName?: string;
  debt: number;
  formattedDebt: string;
  paymentTypesCount?: number;
  pendingPaymentsCount?: number;
  hasOverduePayments: boolean;
  status: "ok" | "overdue";
  detailsUrl: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Flats list view model
 */
export interface FlatsListViewModel {
  flats: FlatCardViewModel[];
  totalCount: number;
  isEmpty: boolean;
}

/**
 * Transform API response to Flats List View Model
 * @param apiResponse Response from GET /api/flats
 * @returns Transformed view model for flats list view
 */
export function transformFlatsListData(apiResponse: FlatsResponseDto): FlatsListViewModel {
  const flats = apiResponse.flats.map(transformFlatToCardViewModel);

  return {
    flats,
    totalCount: flats.length,
    isEmpty: flats.length === 0,
  };
}

/**
 * Transform single flat DTO to card view model
 * @param flat Flat DTO from API
 * @returns Flat card view model
 */
export function transformFlatToCardViewModel(flat: FlatDto): FlatCardViewModel {
  // Note: For MVP, we don't have debt calculation in the /api/flats endpoint
  // Debt information is only available in /api/dashboard endpoint
  // For now, we set debt to 0 and status to 'ok'
  // In future, we could enhance the /api/flats endpoint to include debt
  const debt = 0;

  return {
    id: flat.id,
    name: flat.name,
    address: flat.address,
    tenantName: undefined, // Not in MVP database schema
    debt,
    formattedDebt: formatCurrency(debt),
    paymentTypesCount: undefined, // Would require additional query
    pendingPaymentsCount: undefined, // Would require additional query
    hasOverduePayments: debt > 0,
    status: debt > 0 ? "overdue" : "ok",
    detailsUrl: `/flats/${flat.id}`,
    createdAt: flat.created_at,
    updatedAt: flat.updated_at,
  };
}
