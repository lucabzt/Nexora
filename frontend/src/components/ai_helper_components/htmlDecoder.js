import he from 'he';

/**
 * Comprehensive HTML entity decoder that handles all contexts safely
 * - JavaScript string literals (single and double quoted)
 * - JSX attribute values
 * - Template literals
 * - JSX text content
 */
function comprehensiveHtmlDecode(code) {
    let processedCode = code;

    // Step 1: Fix malformed escape sequences first
    processedCode = fixMalformedEscapes(processedCode);

    // Step 2: Process different contexts in order
    processedCode = fixJavaScriptStrings(processedCode);
    processedCode = fixJSXAttributes(processedCode);
    processedCode = fixTemplateLiterals(processedCode);

    // Step 3: Protect JSX-critical entities before decoding
    processedCode = protectJSXEntities(processedCode);

    // Step 4: Decode all other entities safely
    processedCode = he.decode(processedCode);

    // Step 5: Restore protected entities
    processedCode = restoreJSXEntities(processedCode);

    return processedCode;
}

/**
 * Fix malformed escape sequences like \" that appear incorrectly
 */
function fixMalformedEscapes(code) {
    // Fix cases like: title="Opponent"s Deduced Range\"
    // This often happens when apostrophes get incorrectly processed

    // Pattern: quoted string that breaks in the middle with "word and ends with \"
    const malformedPattern = /(\w+\s*=\s*")([^"]*)"(\w+[^"]*?)\\"/g;

    return code.replace(malformedPattern, (match, prefix, firstPart, secondPart) => {
        // Reconstruct as a proper string with escaped apostrophe
        const fullContent = firstPart + "'" + secondPart;
        const escapedContent = fullContent.replace(/"/g, '&quot;');
        return `${prefix}${escapedContent}"`;
    });
}

/**
 * Fix JavaScript string literals (both single and double quoted)
 */
function fixJavaScriptStrings(code) {
    // Handle single-quoted strings with apostrophes/&apos;
    const singleQuotePattern = /'((?:[^'\\]|\\.|&apos;)*)'/g;

    code = code.replace(singleQuotePattern, (match, content) => {
        const hasApostrophe = content.includes("'") || content.includes("&apos;");

        if (hasApostrophe) {
            // Convert &apos; to literal apostrophes
            const cleanContent = content.replace(/&apos;/g, "'");
            // Escape double quotes and wrap in double quotes
            const escapedContent = cleanContent.replace(/"/g, '\\"');
            return `"${escapedContent}"`;
        }

        return match;
    });

    return code;
}

/**
 * Fix JSX attribute values specifically
 */
function fixJSXAttributes(code) {
    // Pattern for JSX attributes: attributeName="value with potential issues"
    const jsxAttributePattern = /(\w+\s*=\s*")([^"]*(?:&apos;|')[^"]*)"/g;

    return code.replace(jsxAttributePattern, (match, prefix, content) => {
        // Convert &apos; to apostrophes, but keep as JSX attribute
        let cleanContent = content.replace(/&apos;/g, "'");

        // For JSX attributes, we need to handle quotes carefully
        // If the content has apostrophes, we can keep them as-is in double quotes
        // But if it has double quotes, we need to escape them or use &quot;
        if (cleanContent.includes('"')) {
            cleanContent = cleanContent.replace(/"/g, '&quot;');
        }

        return `${prefix}${cleanContent}"`;
    });
}

/**
 * Fix template literals
 */
function fixTemplateLiterals(code) {
    const templatePattern = /`((?:[^`\\]|\\.|&apos;)*)`/g;

    return code.replace(templatePattern, (match, content) => {
        // Template literals can handle apostrophes naturally
        return `\`${content.replace(/&apos;/g, "'")}\``;
    });
}

/**
 * Protect JSX-critical entities that would break parsing if decoded
 */
function protectJSXEntities(code) {
    const protectedEntities = {
        '&lt;': '__PROTECTED_LT__',
        '&gt;': '__PROTECTED_GT__',
        '&amp;': '__PROTECTED_AMP__',
        '&quot;': '__PROTECTED_QUOT__',
        // Numeric versions
        '&#60;': '__PROTECTED_LT__',
        '&#62;': '__PROTECTED_GT__',
        '&#38;': '__PROTECTED_AMP__',
        '&#34;': '__PROTECTED_QUOT__',
        // Hex versions
        '&#x3C;': '__PROTECTED_LT__',
        '&#x3E;': '__PROTECTED_GT__',
        '&#x26;': '__PROTECTED_AMP__',
        '&#x22;': '__PROTECTED_QUOT__'
    };

    Object.entries(protectedEntities).forEach(([entity, placeholder]) => {
        code = code.replace(new RegExp(escapeRegex(entity), 'g'), placeholder);
    });

    return code;
}

/**
 * Restore protected entities after decoding
 */
function restoreJSXEntities(code) {
    const protectedEntities = {
        '__PROTECTED_LT__': '&lt;',
        '__PROTECTED_GT__': '&gt;',
        '__PROTECTED_AMP__': '&amp;',
        '__PROTECTED_QUOT__': '&quot;'
    };

    Object.entries(protectedEntities).forEach(([placeholder, entity]) => {
        code = code.replace(new RegExp(escapeRegex(placeholder), 'g'), entity);
    });

    return code;
}

/**
 * Escape special regex characters
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default comprehensiveHtmlDecode;