import { SFCBlock, SFCDescriptor } from "vue-template-compiler";
import * as fs from "fs";

import { logger } from "../utils/log";

function genTag(t: SFCBlock) {
  if (t.lang) {
    return ` lang="${t.lang}"`
  }
  if (t.module) {
    return ` module`
  }
  if (t.scoped) {
    return ` scoped`
  }
  return ''
}

export function genTemplate(template: SFCBlock | undefined) {
  if (!template) {
    return ''
  }
  return `<template${genTag(template)}>${template.content}</template>\n`
}

export function genScript(script: SFCBlock | undefined) {
  if (!script) {
    return ''
  }
  return `<script${genTag(script)}>${script.content}</script>\n`
}

export function genStyles(styles: SFCBlock[]) {
  return styles.map(it => {
    return `<style${genTag(it)}>${it.content}</style>`
  });
}

export function sfcToFile(sfc: SFCDescriptor, filename: string) {
  let s = [genTemplate(sfc.template), genScript(sfc.script), ...genStyles(sfc.styles)]
  fs.writeFile(filename, s.join('\n'), { encoding: 'utf-8' }, (err) => {
    if (err) {
      logger.error(`generating ${filename} error: `, err)
    }
  });
}
