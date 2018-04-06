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
  return db.createTable('candles', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    pair: 'string',
    close_time: 'datetime',
    open: 'decimal',
    high: 'decimal',
    low: 'decimal',
    close: 'decimal',
    volume: 'decimal'
  });
};

exports.down = function(db) {
  return db.dropTable('candles');
};

exports._meta = {
  "version": 1
};
