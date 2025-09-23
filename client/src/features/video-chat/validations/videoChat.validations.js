import * as Yup from "yup";

export const InterviewSchema = Yup.object().shape({
  opportunityId: Yup.string().required("Please select a job offer"),
  applicationId: Yup.string().required("Please select a candidate"),
  notes: Yup.string(),
  durationMinutes: Yup.number()
    .min(15, "Minimum duration is 15 minutes")
    .required("Duration is required"),
  type: Yup.string().oneOf(["video", "in-person"]).required("Type is required"),
  time: Yup.string()
    .required("Please select a time")
    .test("within-working-hours", "Time must be between 08:00 and 17:00", function (value) {
      if (!value) return false;
      const [hour, minute] = value.split(":").map(Number);
      return hour >= 8 && (hour < 17 || (hour === 17 && minute === 0));
    })
    .test("not-in-past", "Time cannot be in the past", function (value) {
      const { date } = this.parent;
      if (!date || !value) return true;

      const [hour, minute] = value.split(":").map(Number);
      const selectedDateTime = new Date(date);
      selectedDateTime.setHours(hour, minute, 0, 0);

      const now = new Date();
      return selectedDateTime >= now;
    }),
});
