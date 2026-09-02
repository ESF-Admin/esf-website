import { defineField, defineType } from "sanity";
import {
  weeklyDocumentFields,
  weeklyDocumentOrderings,
  weeklyDocumentPreview,
  pdfField,
  fileTypeValidator,
  WORD_MIME_TYPES,
  WORD_EXTENSIONS,
} from "./shared";

export const bulletin = defineType({
  name: "bulletin",
  title: "Bulletin",
  type: "document",
  fields: [
    ...weeklyDocumentFields("bulletin"),
    defineField({
      name: "file",
      title: "Bulletin file (Word document)",
      type: "file",
      options: {
        accept:
          ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      description: "Upload the .docx bulletin (the order of service). Leave empty until the file is ready — the site shows a disabled View button until then.",
      validation: (rule) =>
        rule.custom(
          fileTypeValidator(
            "Word document (.doc/.docx)",
            WORD_MIME_TYPES,
            WORD_EXTENSIONS,
          ),
        ),
    }),
    pdfField(),
  ],
  preview: weeklyDocumentPreview(),
  orderings: weeklyDocumentOrderings,
});
