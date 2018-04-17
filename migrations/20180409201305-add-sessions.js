'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('sessions', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    name: 'string',
    pair: 'string',
    time_frame: 'int',
    backtest: 'boolean',
    paper_trade: 'boolean',
  });
};

exports.down = function(db) {
  return db.dropTable('sessions');
};

exports._meta = {
  "version": 1
};