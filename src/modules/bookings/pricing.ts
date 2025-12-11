// src/modules/pricing/pricing.service.ts
import { query } from "../../config/db";

// ----- TYPES -----

export type PricingRuleRow = {
  id: number;
  name: string;
  applies_to: "COURT" | "EQUIPMENT" | "COACH" | "OVERALL";
  is_weekend: boolean | null;
  start_hour: number | null;
  end_hour: number | null;
  indoor_only: boolean | null;
  rule_type: "MULTIPLIER" | "FLAT";
  value: number; // multiplier value or flat amount
};

export type EquipmentSelection = {
  equipmentTypeId: number;
  quantity: number;
  pricePerUnit: number;
};

export type PriceBreakdown = {
  baseCourt: number;
  baseEquipment: number;
  baseCoach: number;
  adjustments: {
    ruleId: number;
    name: string;
    appliesTo: string;
    amount: number; // positive or negative adjustment
  }[];
  total: number;
};

// ----- GET ACTIVE PRICING RULES -----

export const getActivePricingRulesService = async (): Promise<
  PricingRuleRow[]
> => {
  const res = await query(
    `
    SELECT
      id,
      name,
      applies_to,
      is_weekend,
      start_hour,
      end_hour,
      indoor_only,
      rule_type,
      value,
      is_active
    FROM pricing_rules
    WHERE is_active = true
    ORDER BY id ASC
    `
  );

  return res.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    applies_to: row.applies_to,
    is_weekend: row.is_weekend,
    start_hour: row.start_hour,
    end_hour: row.end_hour,
    indoor_only: row.indoor_only,
    rule_type: row.rule_type,
    value: Number(row.value),
  }));
};

// ----- CORE PRICING ENGINE -----

export const calculateBookingPrice = (
  startTime: Date,
  endTime: Date,
  court: { base_hourly_rate: number; is_indoor: boolean },
  selectedEquipment: EquipmentSelection[],
  coach: { hourly_rate: number } | null,
  rules: PricingRuleRow[]
): PriceBreakdown => {
  // duration in hours (can be fractional)
  const msDiff = endTime.getTime() - startTime.getTime();
  const hours = msDiff / (1000 * 60 * 60);
  const round2 = (n: number) => Number(n.toFixed(2));
  // 1) Base prices
  const baseCourt = court.base_hourly_rate * hours;

  const baseEquipment = selectedEquipment.reduce((sum, item) => {
    return sum + item.pricePerUnit * item.quantity;
  }, 0);

  const baseCoach = coach ? coach.hourly_rate * hours : 0;

  const isWeekend = [0, 6].includes(startTime.getDay()); // 0 = Sun, 6 = Sat
  const bookingHour = startTime.getHours();

  const adjustments: PriceBreakdown["adjustments"] = [];

  // 2) Apply rules
  for (const rule of rules) {
    // Weekend filter (if rule cares about weekend/weekdays)
    if (rule.is_weekend !== null) {
      if (rule.is_weekend !== isWeekend) continue;
    }

    // Hour window filter
    if (rule.start_hour !== null && rule.end_hour !== null) {
      const withinHourRange =
        bookingHour >= rule.start_hour && bookingHour < rule.end_hour;
      if (!withinHourRange) continue;
    }

    // Indoor-only filter
    if (rule.indoor_only === true && !court.is_indoor) {
      continue;
    }

    // Decide which base this rule should apply to
    let baseForRule = 0;

    switch (rule.applies_to) {
      case "COURT":
        baseForRule = baseCourt;
        break;
      case "EQUIPMENT":
        baseForRule = baseEquipment;
        break;
      case "COACH":
        baseForRule = baseCoach;
        break;
      case "OVERALL":
        baseForRule = baseCourt + baseEquipment + baseCoach;
        break;
      default:
        baseForRule = 0;
    }

    if (baseForRule <= 0) continue;

    // Calculate adjustment amount
    let amount = 0;
    if (rule.rule_type === "MULTIPLIER") {
      // e.g. base 400, value 1.5 => +200
      amount = baseForRule * (rule.value - 1);
    } else if (rule.rule_type === "FLAT") {
      // flat extra fee
      amount = rule.value;
    }

    if (amount === 0) continue;

    adjustments.push({
      ruleId: rule.id,
      name: rule.name,
      appliesTo: rule.applies_to,
      amount,
    });
  }

  const totalAdjustments = adjustments.reduce(
    (sum, adj) => sum + adj.amount,
    0
  );

  const total = baseCourt + baseEquipment + baseCoach + totalAdjustments;

  return {
    baseCourt: round2(baseCourt),
    baseEquipment: round2(baseEquipment),
    baseCoach: round2(baseCoach),
    adjustments: adjustments.map((a) => ({
      ...a,
      amount: round2(a.amount),
    })),
    total: round2(total),
  };
};
