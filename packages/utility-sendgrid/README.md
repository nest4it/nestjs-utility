# @n4it/utility-sendgrid
A NestJS module for sending emails with SendGrid. The `SendGridEmailModule` will listen to events and send emails via sendgrid accordingly.

## Installation
To install the module, use npm:

```bash
npm install @n4it/utility-sendgrid
```

## Usage

### Importing and Configuring the Module
To use the `SendGridEmailModule`, import it into your NestJS module and configure it using the `register` method. This method exposes an event listener, so you can sending emails.

```typescript
import { SendGridEmailModule } from "@n4it/utility-sendgrid";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    SendGridEmailModule.register({
      logErrros: true,
      apiKey: "SG-....",
      fromEmail: "hello@example.com",
      exponentialBackoff: {
        maxRetries: 3,
        baseDelayMs: 1000
      },
    }),
  ],
})
export class AppModule {}
```

## License
This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request or open an issue on GitHub.

## Support
If you have any questions or need support, you can contact us at [info@n4it.nl](mailto:info@n4it.nl).
