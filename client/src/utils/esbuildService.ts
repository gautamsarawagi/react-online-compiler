import * as esbuild from 'esbuild-wasm';

class EsbuildService {
  private static instance: EsbuildService;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): EsbuildService {
    if (!EsbuildService.instance) {
      EsbuildService.instance = new EsbuildService();
    }
    return EsbuildService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.doInitialize();
    return this.initializationPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      await esbuild.initialize({
        wasmURL: 'https://unpkg.com/esbuild-wasm@0.25.9/esbuild.wasm',
      });
      this.initialized = true;
    } catch (error) {
      this.initializationPromise = null;
      throw error;
    }
  }

  async transform(code: string, options: esbuild.TransformOptions): Promise<esbuild.TransformResult> {
    if (!this.initialized) {
      throw new Error('Esbuild not initialized. Call initialize() first.');
    }
    return esbuild.transform(code, options);
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const esbuildService = EsbuildService.getInstance(); 