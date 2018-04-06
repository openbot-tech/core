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
  return db.createTable('signals', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    type: 'string',
    candle_id: {
      type: 'int',
      foreignKey: {
        name: 'signals_candle_id_fk',
        table: 'candles',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      }    
    }
  });
};

exports.down = function(db) {
  return db.dropTable('signals');
};

exports._meta = {
  "version": 1
};
