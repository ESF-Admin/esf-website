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

export const sermon = defineType({
  name: "sermon",
  title: "Sermon",
  type: "document",
  fields: [
    ...weeklyDocumentFields("sermon"),
    defineField({
      name: "speaker",
      title: "Speaker",
      type: "string",
      description: "Who preached this message.",
    }),
    defineField({
      name: "file",
      title: "Sermon file (Word document)",
      type: "file",
      options: {
        accept:
          ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      description: "Upload the .docx sermon manuscript. Leave empty until the file is ready — the site shows a disabled View button until then.",
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
