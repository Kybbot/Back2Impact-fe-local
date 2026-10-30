export type MainInfo = {
    fullName: string;
    basedCountry: string;
    interests: string[];
};

export type FileInfo = {
    name: string;
    type: "cv" | "other";
    mimeType: string;
    size: number;
};

export type PresignedURL = {
    key: string;
    url: string;
    fields: {
        [key: string]: string;
    };
};

export type PatchFile = {
    status: "confirmed" | "failed";
    key: string;
};

export type UserRole = "candidate" | "employer";

export type EmployerWhenApplies = "email_straight_away" | "one_daily_summary" | "dont_email_me";

export type UserData = {
    id: string;
    email: string;
    role: UserRole;
    emailVerified: boolean;
    fullName: string;
    status: "created" | "finished";
    cvExists: boolean;
    cvName: string | null;
    profilePictureUrl: string | null;
    audienceSegment: string;
    opportunityTypes: string[];
    sectors: string[];
    professionalAreas: string[];
    basedCountry: string;
    workLocationPreference: string;
    locations: { region: string; cities: string[] | null }[];
    comment: string | null;
    coverLetter: string | null;
    experience: {
        id: number;
        userId: string;
        company: string;
        title: string;
        startMonth: number;
        startYear: number;
        endMonth: number | null;
        endYear: number | null;
        description: string | null;
    }[];
    education: {
        id: number;
        userId: string;
        institution: string;
        fieldOfStudy: string;
        degree: string | null;
        startYear: number;
        endYear: number | null;
        description: string | null;
    }[];
    languages: {
        language: string;
        level: string;
    }[];
    projects: {
        id: number;
        name: string;
        link: string | null;
        description: string | null;
    }[];
    documents: {
        id: number;
        name: string;
        type: "cv" | "portfolio" | "cover_letter" | "other";
        key: string;
        mimeType: string;
        createdAt: Date;
    }[];
    savedCount: number;
    language: "ua" | "en";
    newOpportunitiesEmails: boolean;
    applicationUpdatesEmails: boolean;
    profileVisibleToEmployers: boolean;

    // company
    company: {
        id: number;
        name: string | null;
        sectors: string[] | null;
        descriptionUk: string | null;
        descriptionEn: string | null;
        website: string | null;
        companySize: string | null;
        logoKey: string | null;
        headquarters: string | null;
        founded: number | null;
    } | null;

    whenApplies: EmployerWhenApplies | null;
    emailWhenVacancyPassesReview: boolean | null;
    emailWhenVacancyIsAboutToExpire: boolean | null;
    emailWeeklySummary: boolean | null;
    additionalEmail: string | null;
};

export type ChangePasswordDTO = {
    password: string;
    token: string;
};

export type OnboardingInfo = {
    audienceSegment: string;
    opportunityTypes: string[];
    sectors: string[];
    professionalAreas: string[];
    basedCountry: string;
    workLocationPreference: string;
    locations: { region: string; cities: string[] | null }[];
};

export type PostJobApplyFileDTO = {
    type: "cv" | "attachment";
    mimeType: string;
    size: number;
};

export type PostJobApplyDTO = {
    jobId: number;
    cv?: { name: string; mimeType: string; key: string };
    attachment?: { name: string; mimeType: string; key: string };
    letter: string;
};

export type BasicInfo = {
    opportunityTypes: string[];
    sectors: string[];
    professionalAreas: string[];
    basedCountry: string;
    workLocationPreference: string;
    locations: { region: string; cities: string[] | null }[];
};

export type GetUserSettingsType = {
    language: "en" | "ua";
    newOpportunitiesEmails: boolean;
    applicationUpdatesEmails: boolean;
    profileVisibleToEmployers: boolean;
};

export type ChangeUserSettingsBodyType = {
    language: "en" | "ua";
    newOpportunitiesEmails: boolean;
    applicationUpdatesEmails: boolean;
    profileVisibleToEmployers: boolean;
};

export type ChangeEmployerSettingsBodyType = {
    language: "en" | "ua";
    whenApplies: EmployerWhenApplies;
    emailWhenVacancyPassesReview: boolean;
    emailWhenVacancyIsAboutToExpire: boolean;
    emailWeeklySummary: boolean;
    additionalEmail: string | null;
};

export type ChangeUserPasswordBodyType = {
    currentPassword: string;
    password: string;
};

export type DeleteAccountBodyType = {
    reasons: string[];
    comment: string;
};

export type UserWorkExperienceType = {
    id: string;
    userId: string;
    title: string;
    company: string;
    startMonth: number;
    startYear: number;
    endMonth?: number;
    endYear?: number;
    currentlyWorkingHere: boolean;
    description?: string;
};

export type GetUserWorkExperienceType = UserWorkExperienceType[];

export type AddUserWorkExperienceBodyType = {
    company: string;
    title: string;
    startMonth: number;
    startYear: number;
    endMonth?: number;
    endYear?: number;
    currentlyWorkingHere: boolean;
    description?: string;
};

export type UserEducationType = {
    id: string;
    userId: string;
    institution: string;
    fieldOfStudy: string;
    degree?: "bachelors" | "masters" | "phd" | "other";
    startYear: string;
    endYear?: string;
    description?: string;
};

export type GetUserEducationType = UserEducationType[];

export type AddUserEducationBodyType = {
    institution: string;
    fieldOfStudy: string;
    degree?: "bachelors" | "masters" | "phd" | "other";
    startYear: number;
    endYear?: number;
    description?: string;
};

export type UserLanguageType = {
    language: string;
    level: "a1" | "a2" | "b1" | "b2" | "c1" | "c2" | "native";
};

export type GetUserLanguagesType = UserLanguageType[];

export type AddUserLanguageBodyType = {
    language: string;
    level: "a1" | "a2" | "b1" | "b2" | "c1" | "c2" | "native";
}[];

export type UserProjectType = {
    id: string;
    userId: string;
    name: string;
    link?: string;
    description?: string;
};

export type GetUserProjectsType = UserProjectType[];

export type AddUserProjectBodyType = {
    name: string;
    link?: string;
    description?: string;
};

export type PostFileDTO = {
    mimeType: string;
    type: string;
    name: string;
    key: string;
};
