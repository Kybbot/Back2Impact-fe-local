import { Controller, useFormContext } from "react-hook-form";
import { useT } from "@/i18n/use-t";
import { useOutletContext } from "react-router";
import CardHeader from "../components/card-header/card-header";
import { CustomSearchSelect } from "@/components/shared/form/CustomSelect/CustomSearchSelect";

type Props = {
    className?: string;
};

type OnboardingContext = {
    options: { countries: { [key: string]: string } };
};

function LocationCard({ className }: Props) {
    const { t } = useT("onboarding");
    const { options } = useOutletContext<OnboardingContext>();
    const { control } = useFormContext();

    const countryOptions = Object.entries(options.countries).map(([value, label]) => ({ value, label }));

    return (
        <div className={`location-card ${className}`}>
            <CardHeader heading={t("location.heading")} description={t("location.description")} />
            <Controller
                control={control}
                name="basedCountry"
                render={({ field }) => (
                    <CustomSearchSelect
                        hideLabel
                        id="basedCountry"
                        value={field.value}
                        onBlur={field.onBlur}
                        options={countryOptions}
                        label={t("location.heading")}
                        onValueChange={field.onChange}
                        className="location-card__select"
                        placeholder={t("location.selectCountry")}
                    />
                )}
            />
        </div>
    );
}

export default LocationCard;
