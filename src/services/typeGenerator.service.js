/**
 * TypeScript Type Generator Service
 * Automatically converts JSON sample payloads into clean TypeScript type definitions.
 */
export class TypeGeneratorService {
  /**
   * Capitalize string for interface naming
   * @param {string} str 
   * @returns {string}
   */
  static pascalCase(str) {
    if (!str) return 'Api';
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Helper to determine TypeScript type of a given value
   * @param {any} value 
   * @param {string} keyName 
   * @param {Array<string>} childInterfaces 
   * @returns {string}
   */
  static getTypeString(value, keyName = '', childInterfaces = []) {
    if (value === null || value === undefined) return 'any';
    const type = typeof value;

    if (type === 'string') return 'string';
    if (type === 'number') return 'number';
    if (type === 'boolean') return 'boolean';

    if (Array.isArray(value)) {
      if (value.length === 0) return 'any[]';
      const firstElemType = this.getTypeString(value[0], keyName ? `${keyName}Item` : 'Item', childInterfaces);
      return `${firstElemType}[]`;
    }

    if (type === 'object') {
      const interfaceName = this.pascalCase(keyName) || 'SubObject';
      const properties = [];

      for (const [k, v] of Object.entries(value)) {
        const propType = this.getTypeString(v, k, childInterfaces);
        properties.push(`  ${k}: ${propType};`);
      }

      const interfaceCode = `export interface ${interfaceName} {\n${properties.join('\n')}\n}`;
      childInterfaces.push(interfaceCode);
      return interfaceName;
    }

    return 'any';
  }

  /**
   * Generates TypeScript Interface for a given JS object or JSON string
   * @param {string} interfaceName 
   * @param {Object|string} payload 
   * @returns {string}
   */
  static generateFromPayload(interfaceName, payload) {
    if (!payload) return `export interface ${interfaceName} {}`;

    let parsed = payload;
    if (typeof payload === 'string') {
      try {
        parsed = JSON.parse(payload);
      } catch (e) {
        return `export type ${interfaceName} = string;`;
      }
    }

    const childInterfaces = [];
    const rootType = this.getTypeString(parsed, interfaceName, childInterfaces);

    if (rootType !== interfaceName) {
      if (rootType.endsWith('[]')) {
        return `${childInterfaces.join('\n\n')}\n\nexport type ${interfaceName} = ${rootType};`.trim();
      }
      return `${childInterfaces.join('\n\n')}`.trim();
    }

    return childInterfaces.join('\n\n').trim();
  }

  /**
   * Generates full TypeScript contract for a request endpoint
   * @param {string} requestName 
   * @param {Object} body 
   * @param {Object|null} successExample 
   * @param {Array} failureExamples 
   */
  static generateEndpointTypes(requestName, body, successExample, failureExamples = []) {
    const baseName = this.pascalCase(requestName);
    const reqBodyPayload = body?.type === 'json' ? body.rawContent : null;

    const requestInterface = this.generateFromPayload(`${baseName}Request`, reqBodyPayload);
    const successInterface = this.generateFromPayload(
      `${baseName}Response`,
      successExample ? successExample.body : null
    );

    const errorTypes = [];
    if (failureExamples && failureExamples.length > 0) {
      failureExamples.forEach((ex, idx) => {
        const errorName = `${baseName}Error${ex.statusCode || idx + 1}`;
        errorTypes.push(this.generateFromPayload(errorName, ex.body));
      });
    } else {
      errorTypes.push(`export interface ${baseName}ErrorResponse {\n  success: false;\n  message: string;\n}`);
    }

    return [
      `// Auto-generated TypeScript definitions for ${requestName}`,
      requestInterface,
      successInterface,
      ...errorTypes,
    ].join('\n\n');
  }
}
