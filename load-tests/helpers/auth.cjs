"use strict";

const fs = require("node:fs");
const path = require("node:path");

let fixtures = null;
function getFixtures() {
  if (fixtures) return fixtures;
  const p = path.join(__dirname, "..", "fixtures.json");
  fixtures = JSON.parse(fs.readFileSync(p, "utf8"));
  return fixtures;
}

function setAuth(context, _events, done) {
  const f = getFixtures();
  context.vars.auth = `Bearer ${f.apiKey}`;
  context.vars.workspaceId = f.workspaceId;
  context.vars.productId = f.productId;
  context.vars.slug = f.slug;
  return done();
}

function setPublicVars(context, _events, done) {
  const f = getFixtures();
  context.vars.workspaceId = f.workspaceId;
  context.vars.productId = f.productId;
  context.vars.slug = f.slug;
  return done();
}

function wsConnect(wsArgs, _context, callback) {
  const f = getFixtures();
  wsArgs.target = `ws://localhost:1337/api/ws/workspace/${f.workspaceId}`;
  wsArgs.options = {
    headers: { Authorization: `Bearer ${f.apiKey}` },
  };
  return callback(null);
}

module.exports = { setAuth, setPublicVars, wsConnect, getFixtures };
