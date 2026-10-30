export type BasicInfo = {
    opportunityTypes: string[],
    sectors: string[],
    professionalAreas: string[],
    basedCountry: string,
    workLocationPreference: string,
    locations: { region: string; cities: string[] | null }[];
}

export type EditBasicInfoFormRef = {
    isDirty: boolean;
    openPopup: () => void;
}