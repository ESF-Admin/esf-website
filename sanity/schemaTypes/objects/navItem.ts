import { defineField, defineType } from "sanity";
import { hrefField } from "../shared";

const CHILD_SOURCES = [
  { title: "No dropdown", value: "none" },
  { title: "Manual list below", value: "manual" },
  { title: "Bulletin/Sermon languages (generated)", value: "docLocales" },
  { title: "Mission countries (generated)", value: "missionCountries" },
  { title: "Ministries (generated)", value: "ministries" },
];

export const navChildLink = defineType({
  name: "navChildLink",
  title: "Sub-link",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required().max(60) }),
    hrefField(),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

export const navItem = defineType({
  name: "navItem",
  title: "Nav item",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required().max(60),
    }),
    hrefField(),
    defineField({
      name: "childSource",
      title: "Dropdown",
      type: "string",
      description:
        "Does this nav item open a dropdown, and where do its items come from?",
      options: { list: CHILD_SOURCES, layout: "radio" },
      initialValue: "none",
    }),
    defineField({
      name: "children",
      title: "Dropdown links",
      type: "array",
      of: [{ type: "navChildLink" }],
      hidden: ({ parent }) => parent?.childSource !== "manual",
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});
