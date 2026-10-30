import { useState } from "react";

import { getCompanyInitials, getCompanyLogoUrl } from "@/utils/company";

type Props = {
    name: string | null;
    logoKey: string | null;
    className?: string;
};

/** always shown next to the company name, so the image itself is decorative */
function CompanyLogo({ name, logoKey, className }: Props) {
    const logoUrl = getCompanyLogoUrl(logoKey);
    // the url a load failed for; a new logo gets its own try
    const [failedUrl, setFailedUrl] = useState<string | null>(null);

    return (
        <div className={`company-logo ${className ?? ""}`} aria-hidden="true">
            {logoUrl && logoUrl !== failedUrl ? (
                <img className="company-logo__img" src={logoUrl} alt="" onError={() => setFailedUrl(logoUrl)} />
            ) : (
                <span className="company-logo__initials">{getCompanyInitials(name)}</span>
            )}
        </div>
    );
}

export default CompanyLogo;
