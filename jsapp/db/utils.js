import { DataTypes } from 'sequelize';

export const t = {
  primaryKey: () => {
    return {
      type: 'attribute',
      name: 'cid',
      definition: { type: DataTypes.STRING, primaryKey: true },
    };
  },
  string: name => {
    return { type: 'attribute', name, definition: DataTypes.STRING };
  },
  stringArray: name => {
    return {
      type: 'attribute',
      name,
      definition: {
        type: DataTypes.TEXT,
        get() {
          return this.getDataValue(name).split(';');
        },
      },
    };
  },
  text: name => {
    return { type: 'attribute', name, definition: DataTypes.TEXT };
  },
  integer: name => {
    return { type: 'attribute', name, definition: DataTypes.INTEGER };
  },
  date: name => {
    return { type: 'attribute', name, definition: DataTypes.DATEONLY };
  },
  float: name => {
    return { type: 'attribute', name, definition: DataTypes.FLOAT };
  },
  boolean: name => {
    return {
      type: 'attribute',
      name,
      definition: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    };
  },
  index: (name, params = null) => {
    const definition = { fields: [name] };
    if (!params) return { type: 'index', name, definition };
    if (params.unique) definition.unique = true;
    if (params.order) definition.fields[0] = { name, order: params.order };
    return { type: 'index', name, definition };
  },
  model: (modelName, ...definitions) => {
    const attributes = {};
    const options = { modelName, indexes: [] };

    definitions.forEach(({ type, name, definition }) => {
      if (type === 'attribute') attributes[name] = definition;
      if (type === 'index') options.indexes.push(definition);
    });

    return [modelName, attributes, options];
  },
};
