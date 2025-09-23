// // "use client"
// // import React from "react";
// // import { useOpportunityById, useUpdateOpportunity } from "../hooks/opportunities.hooks";
// // import { Box } from "@mui/material";
// // import GenericFormikForm from "@/components/form/GenericFormikForm";
// // import { opportunityEditFields } from "./OpportunityEditPage.columns";
// // import OpportunitiesReturnButton from "./OpportunitiesReturnButton";

// // export default function OpportunityEditPage({ opportunityId, styles }) {
// //   const { data, isLoading, error } = useOpportunityById(opportunityId);
// //     const { mutate: updateOpportunityMutation } = useUpdateOpportunity();
  

// //   if (isLoading) return <Box>Loading...</Box>;
// //   if (error) return <Box>Error loading opportunity.</Box>;

// //   const handleSubmit = (values) => {
// //     updateOpportunityMutation(
// //       { id: opportunityId, values },
// //       {
// //         onSuccess: () => {
// //           console.log("user updated with suc");
// //         },
// //       }
// //     );
// //   };


// //   return (
// //     <Box className={styles.editWrapper}>
// //       <OpportunitiesReturnButton styles={styles} />
      
// //       <h2 className={styles.editTitle}>Edit Opportunity</h2>
// //       <GenericFormikForm
// //       initialValues={data}
// //       //validationSchema={validationSchema}
// //       onSubmit={handleSubmit}
// //       fields={opportunityEditFields}
// //       submitText="Update Opportunity"
// //       styles={styles}
// //       formClassName={styles.formEdit}
// //     />
// //     </Box>
// //   );
// // }
// // OpportunityEditPage.tsx
// // OpportunityEditPage.tsx
// "use client";
// import React from "react";
// import { Box } from "@mui/material";
// import { useOpportunityById, useUpdateOpportunity } from "../hooks/opportunities.hooks";
// import GenericFormikForm from "@/components/form/GenericFormikForm";
// import OpportunitiesReturnButton from "./OpportunitiesReturnButton";
// import { versionFields, opportunityEditFields } from "./OpportunityEditPage.columns";
// import GenericCard from "@/components/ui/surfaces/Card";

// export default function OpportunityEditPage({ opportunityId, styles }) {
//   const { data, isLoading, error } = useOpportunityById(opportunityId);
//   const { mutate: updateOpportunity } = useUpdateOpportunity();

//   if (isLoading) return <Box>Loading…</Box>;
//   if (error) return <Box>Error loading opportunity.</Box>;


// const handleSubmit = (values) => {
//   const {
//     title,
//     visibility,
//     isArchived,
//     metaTitle,
//     metaDescription,
//     jobDescription,
//     ...rest
//   } = values;

//   const preparedData = {
//     ...rest,
//     OpportunityVersions: [
//       {
//         title,
//         visibility,
//         isArchived,
//         metaTitle,
//         metaDescription,
//         jobDescription,
//       },
//     ],
//   };


//   updateOpportunity(
//     { id: opportunityId, values: preparedData },
//   );
// };


//   return (
//       <GenericCard styles={styles} className={styles.editCard} >
      
//       <OpportunitiesReturnButton styles={styles} />
//         <div className={styles.headerRow}>
//           <h2 className={styles.editTitle}>Edit Opportunity</h2>
//           <span className={styles.editSubTitle}>[{data.reference}]</span>
//         </div>
//       <GenericFormikForm
//         initialValues={{ ...data, ...(data.OpportunityVersions?.[0] || {}) }}
//         onSubmit={handleSubmit}
//         fields={opportunityEditFields}
//         submitText="Update Opportunity"
//         styles={styles}
//         formClassName={styles.formEdit}
//       />
//       </GenericCard>
//   );
// }
"use client";
import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useOpportunityById, useUpdateOpportunity } from "../hooks/opportunities.hooks";
import GenericFormikForm from "@/components/form/GenericFormikForm";
import OpportunitiesReturnButton from "./OpportunitiesReturnButton";
import { opportunityEditFields } from "./OpportunityEditPage.columns";
import GenericCard from "@/components/ui/surfaces/Card";
import { loadCities } from "@/utils/functions";

export default function OpportunityEditPage({ opportunityId, styles }) {
  const { data, isLoading, error } = useOpportunityById(opportunityId);
  const { mutate: updateOpportunity } = useUpdateOpportunity();

  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");

  useEffect(() => {
  console.log("Opportunity data:", data);
}, [data]);

  useEffect(() => {
    loadCities().then(setCities).catch(console.error);
  }, []);

  // Set initial country if editing
  useEffect(() => {
    if (data?.country) {
      setSelectedCountry(data.country);
    }
  }, [data]);

  if (isLoading) return <Box>Loading…</Box>;
  if (error) return <Box>Error loading opportunity.</Box>;

  const handleCountryChange = (e, setFieldValue) => {
    const country = e.target.value;
    setFieldValue("country", country);
    setFieldValue("city", ""); // reset city when country changes
    setSelectedCountry(country);
  };

  // Rebuild fields with country → city dependency
  const fields = opportunityEditFields.map((field) => {
    if (field.name === "country") {
      return { ...field, onChange: handleCountryChange };
    }

    if (field.name === "city") {
      const options = selectedCountry
        ? cities
            .filter((c) => c.country === selectedCountry)
            .map((c) => ({
              label: c.city,
              value: c.city,
              lat: c.lat,
              lng: c.lng,
            }))
        : [];

      return {
        ...field,
        options,
        disabled: !selectedCountry,
        placeholder: "", // no placeholder, default is pre-filled
      };
    }

    return field;
  });

  const handleSubmit = (values) => {
    const {
      title,
      visibility,
      isArchived,
      metaTitle,
      metaDescription,
      jobDescription,
      city,
      ...rest
    } = values;

    // Find the selected city object (with lat/lng)
    const selectedCity = cities.find((c) => c.city === city) || data?.city;

    const preparedData = {
      ...rest,
      city: selectedCity
        ? {
            name: selectedCity.city || selectedCity.name,
            lat: selectedCity.lat,
            lng: selectedCity.lng,
          }
        : null,
      OpportunityVersions: [
        {
          title,
          visibility,
          isArchived,
          metaTitle,
          metaDescription,
          jobDescription,
        },
      ],
    };

    updateOpportunity({ id: opportunityId, values: preparedData });
  };

  return (
    <GenericCard styles={styles} className={styles.editCard}>
      <OpportunitiesReturnButton styles={styles} />
      <div className={styles.headerRow}>
        <h2 className={styles.editTitle}>Edit Opportunity</h2>
        <span className={styles.editSubTitle}>[{data.reference}]</span>
      </div>
      <GenericFormikForm
        initialValues={{
          ...data,
          ...(data.OpportunityVersions?.[0] || {}),
          city: data?.city?.name || "", 
          dateOfExpiration: data?.dateOfExpiration
    ? new Date(data.dateOfExpiration).toISOString().split("T")[0]
    : "",
        }}
        onSubmit={handleSubmit}
        fields={fields}
        submitText="Update Opportunity"
        styles={styles}
        formClassName={styles.formEdit}
      />
    </GenericCard>
  );
}
