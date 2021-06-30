export class DigitalInspectorProduct {
  productId: string;
  position: number;
  factoryNumber: string;
  percentComplete: number;
  schedulePlan: {
    schedulePlanId: string;
    ppiId: string;
    actualCompletionDate: Date | null;
    contractCompletionDate: Date | null;
    plannedCompletionDate: Date | null;
    firstActualStage: Stage;
    firstPlannedStage: Stage;
    isTemplate: boolean;
    percentComplete: number;
    stages: Stage[];
  };
}

interface Stage {
  schedulePlanStageId: string;
  expectedDuration: number;
  percentComplete: number;
  plannedStartDate: Date | null;
  calculatedStartDate: Date | null;
  actualStartDate: Date | null;
  plannedEndDate: Date | null;
  calculatedEndDate: Date | null;
  actualEndDate: Date | null;
  lastInspectionDate: Date | null;
  note: string;
  directoryId: string;
  directoryName: string;
  position: number;
  previousStageId: string;
  isBaked: boolean;
  isShipment: boolean;
  hasNotice: boolean;
}
