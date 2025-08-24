import React from "react";
import { esbuildService } from "./esbuildService";

/**
 * @deprecated Use CodeExecutor component instead
 * This function is kept for backward compatibility
 */
export const buildEsbuild = async (code: string) => {
    await esbuildService.initialize();
    
    const result = await esbuildService.transform(code, {
        loader: "jsx",
        jsx: "transform",
        jsxFactory: "React.createElement",
        jsxFragment: "React.Fragment",
    });

    // Remove import and export statements and prepare for execution
    let executableCode = result.code;

    // Remove all import statements (we'll provide React directly)
    executableCode = executableCode.replace(
        /import\s+.*?from\s+['"][^'"]*['"];?\s*/g,
        ""
    );
    executableCode = executableCode.replace(
        /import\s+['"][^'"]*['"];?\s*/g,
        ""
    );

    // Replace export default with a variable assignment
    executableCode = executableCode.replace(
        /export\s+default\s+/,
        "var ComponentResult = "
    );

    // Remove any other export statements
    executableCode = executableCode.replace(/export\s+\{[^}]*\}/g, "");

    // Add return statement at the end
    executableCode += "\nreturn ComponentResult;";

    // Create and execute the function with all React exports available
    // Dynamically extract all React exports and make them available
    const modifiedCode = `
          // Make all React exports available in the scope
          ${Object.keys(React)
            .map((key) => `const ${key} = React.${key};`)
            .join("\n")}
          
          ${executableCode}
        `;

    const componentFunction = new Function("React", modifiedCode);
    const Component = componentFunction(React);

    return Component;
};
