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
    },
    session_id: {
      type: 'int',
      foreignKey: {
        name: 'signals_session_id_fk',
        table: 'sessions',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      }    
    },
    type: 'string'
  });
};

exports.down = function(db) {
  return db.dropTable('signals');
};

exports._meta = {
  "version": 1
};
