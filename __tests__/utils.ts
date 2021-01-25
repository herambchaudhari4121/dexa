import type { Server } from 'http';
import express from 'express';
import Dexa from '../src/dexa';

export const oneLine = (input: string): string => input.replace(/(?:\n(?:\s*))+/g, ' ').trim();

export let SERVER: Server | null = null;

export function teardown() {
  return SERVER?.close();
}

export function setup() {
  const app = express();
  const dexa = new Dexa();

  dexa.express({
    expressApp: app,
    debug: true,
    checkCert: false
  });

  SERVER = app.listen();
}
