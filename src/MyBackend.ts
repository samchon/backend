import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { MyConfiguration } from "./MyConfiguration";
import { MyModule } from "./MyModule";

export class MyBackend {
  private application_?: NestFastifyApplication;

  public async open(): Promise<void> {
    // MOUNT CONTROLLERS
    this.application_ = await NestFactory.create(
      MyModule,
      new FastifyAdapter(),
      { logger: false },
    );

    // DO OPEN
    this.application_.enableCors();
    await this.application_.listen(MyConfiguration.API_PORT());
  }

  public async close(): Promise<void> {
    if (this.application_ === undefined) return;

    // DO CLOSE
    await this.application_.close();
    delete this.application_;
  }
}
