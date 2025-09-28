import { build, BuildOptions } from "esbuild";
import { glob } from "glob";
import * as dotenv from "dotenv";

dotenv.config();

const isProduction: boolean = process.env.NODE_DATA === "production";

const sharedConfig: BuildOptions = {
    bundle: true,
    minify: isProduction,
    sourcemap: !isProduction,
    platform: "node",
    format: "cjs",
    external: ["vscode"],
    logLevel: "info"
};

async function main() {
    try {
        const entryPoints: string[] = await glob("src/**/*.ts");

        await build({
            ...sharedConfig,
            entryPoints,
            outdir: "out"
        });
        console.log("Build complete!");
    } catch (error) {
        console.error(`Build failed: ${error}`);
        process.exit(1);
    }
}

main();