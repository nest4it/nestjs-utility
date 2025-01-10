# @n4it/utility-slack-alerts
A NestJS module for creating and sending alerts to Slack.

## Installation
To install the module, use npm:

```bash
npm install @n4it/utility-slack-alerts
```

## Usage


### Importing and Configuring the Module
To use the `SlackAlertsModule`, import it into your NestJS module and configure it using the register method.

```typescript
import { SlackAlertsModule } from "@n4it/utility-slack-alerts";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    SlackAlertsModule.register({
      url: "https://hooks.slack.com/services/XXXXXXX/XXXXXX/XXXXXX"
    }),
  ],
})
export class AppModule {}
```

You can now use it:

```typescript
import { SlackAlertService } from "@n4it/utility-slack-alerts";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  constructor(private readonly alertService: SlackAlertService) {}

  public send() {
    return this.alertService.sendErrorAlert({
        message: "My foo error",
    })
  }
}
```

## License
This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request or open an issue on GitHub.

## Support
If you have any questions or need support, you can contact us at [info@n4it.nl](mailto:info@n4it.nl).
