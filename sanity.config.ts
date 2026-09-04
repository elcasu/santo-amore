"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { installImageMimeFix } from "./sanity/lib/ensure-image-mime";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

installImageMimeFix();

export default defineConfig({
  name: "santo-amore",
  title: "Santo Amore",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  schema: {
    types: schemaTypes,
  },
});
