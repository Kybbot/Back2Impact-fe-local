import { useWatch } from "react-hook-form";
import { useT } from "@/i18n/use-t";
import { useOutletContext } from "react-router";
import CardHeader from "../components/card-header/card-header";
import Confetti from "@/components/shared/confetti/confetti";
import { formatLocations, type Location } from "@/hooks/use-locations";
import { Fragment } from "react/jsx-runtime";
import successIcon from "/img/success-icon.svg";

type FormValues = {
    opportunityTypes: string[];
    sectors: string[];
    professionalAreas?: string[];
    basedCountry: string;
    workLocationPreference: string;
    locations?: Location[];
    cv?: File | null | undefined;
};

type OnboardingContext = {
    options: {
        audienceSegments: string;
        opportunityTypes: { [key: string]: string };
        sectors: { [key: string]: string };
        professionalAreas: { [key: string]: string };
        countries: { [key: string]: string };
        workLocationPreferences: { [key: string]: string };
        regions: { [key: string]: string };
    };
};

type Props = {
    className?: string;
};

function DoneCard({ className }: Props) {
    const { t } = useT("onboarding");
    const { options: o } = useOutletContext<OnboardingContext>();
    const v = useWatch<FormValues>();

    const uiOpportunityTypes = v.opportunityTypes?.map((i) => o.opportunityTypes[i]).join(", ");
    const uiSectors = v.sectors?.map((i) => o.sectors[i]).join(", ");
    const uiProfessionalAreas = v.professionalAreas?.map((i) => o.professionalAreas[i]).join(", ");
    const uiCountry = o.countries[v.basedCountry as string].split(" ")[1];
    const uiWorkLocationLabel = o.workLocationPreferences[v.workLocationPreference as string];
    const uiWorkLocationPreference =
        v.workLocationPreference === "ukraine" ? (
            <>
                {uiWorkLocationLabel}
                <br />
                {v.locations?.length ? formatLocations(v.locations as Location[], o.regions) : "no regions"}
            </>
        ) : (
            uiWorkLocationLabel
        );

    const uiCv = v.cv ? v.cv.name : t("done.cvMissing");
    const data = [
        {
            emoji: "👀",
            label: t("done.lookingFor"),
            value: uiOpportunityTypes,
        },
        {
            emoji: "🗂️",
            label: t("done.sectors"),
            value: uiSectors,
        },
        {
            emoji: "💼",
            label: t("done.professions"),
            value: uiProfessionalAreas,
        },
        {
            emoji: "🌏",
            label: t("done.basedIn"),
            value: uiCountry,
        },
        {
            emoji: "📍",
            label: t("done.workLocation"),
            value: uiWorkLocationPreference,
        },
        {
            emoji: "📄",
            label: "CV",
            value: uiCv,
        },
    ];

    return (
        <div className={`done-card ${className}`}>
            <Confetti className="done-card__confetti" />
            <div className="done-card__header-container">
                <img className="done-card__success-icon" src={successIcon} alt={""} aria-hidden="true" />
                <CardHeader
                    className="done-card__header"
                    heading={t("done.heading")}
                    description={t("done.description")}
                />
            </div>
            <div className="done-card__main">
                {data.map((i, index) => (
                    <Fragment key={i.label}>
                        <div className="done-card__part">
                            <div className="done-card__label-container">
                                <div className="done-card__emoji-container">
                                    <span>{i.emoji}</span>
                                </div>
                                <span className="done-card__label">{i.label}</span>
                            </div>
                            {i.label === "CV" && v.cv ? (
                                <p className="done-card__result done-card__result_cv">{i.value}</p>
                            ) : (
                                <p className="done-card__result">{i.value}</p>
                            )}
                        </div>
                        {index + 1 !== data.length && <hr className="done-card__line" />}
                    </Fragment>
                ))}
            </div>
        </div>
    );
}

export default DoneCard;
