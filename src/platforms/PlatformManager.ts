import { Platform } from "./PlatformInterface";
import { PlatformX } from "./x";
import { PlatformDiscord } from "./discord";
import { PlatformTelegram } from "./telegram";

export class PlatformManager {
  private platforms: Platform[] = [];

  constructor() {
    // Add supported platforms here
    this.platforms.push(new PlatformX());
    this.platforms.push(new PlatformDiscord());
    this.platforms.push(new PlatformTelegram());
  }

  async initializeAll(): Promise<void> {
    for (const platform of this.platforms) {
      console.log(`Starting initialization for: ${platform.name}`);
      await platform.initialize();
    }
    console.log("All platforms are initialized!");
  }

  registerAllEvents(): void {
    for (const platform of this.platforms) {
      console.log(`Registering events for: ${platform.name}`);
      platform.registerEvents();
    }
    console.log("All events are registered!");
  }
}
