import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { MyConfiguration } from "./MyConfiguration";
import { MyGlobal } from "./MyGlobal";
import { MyModule } from "./MyModule";

export class MyBackend {
  private application_?: NestFastifyApplication;

  public async open(): Promise<void> {
    //----
    // OPEN THE BACKEND SERVER
    //----
    // MOUNT CONTROLLERS
    this.application_ = await NestFactory.create(
      MyModule,
      new FastifyAdapter(),
      { logger: false },
    );

    // DO OPEN
    this.application_.enableCors();
    await this.application_.listen(MyConfiguration.API_PORT());

    //----
    // POST-PROCESSES
    //----
    // INFORM TO THE PM2
    if (process.send) process.send("ready");

    // WHEN KILL COMMAND COMES
    process.on("SIGINT", async () => {
      await this.close();
      process.exit(0);
    });
  }

  public async close(): Promise<void> {
    if (this.application_ === undefined) return;

    // DO CLOSE
    await this.application_.close();
    delete this.application_;

    // EXIT FROM THE CRITICAL-SERVER
    if ((await MyGlobal.critical.is_loaded()) === true) {
      const critical = await MyGlobal.critical.get();
      await critical.close();
    }
  }
}
