import TheService from "./_service";
import { FASTRouter, RouterConfiguration, Route } from '@microsoft/fast-router';
import config from "./ConfigService";

type RouteSettings = {
  public?: boolean
};

class AppRouterConfiguration extends RouterConfiguration<RouteSettings> {
  public configure() {
    this.title = 'My App';
    this.defaultLayout = config().get('defaultLayout');
    this.routes.map(...config().get('routes'));

    // this.routes.fallback(
    //   () => Session.isLoggedIn
    //     ? { redirect: 'not-found' }
    //     : { redirect: 'login' }
    // );

    // this.routes.converter("Confirmation", async (confirmationId) => {
    //   return confirmation;
    // });

    this.contributors.push({
      navigate(phase) {
        const settings = phase.route.settings;
        return;
        // if (settings && settings.public) {
        //   return;
        // }
  
        // if (Session.loggedIn) {
        //   return;
        // }
  
        // phase.cancel(() => {
        //   Session.returnUrl = Route.path.current;
        //   Route.name.replace(phase.router, 'login');
        // });
      }
    });
  }
}

class RoutingService extends TheService {
  private routerConfig = new AppRouterConfiguration();

  public config(): AppRouterConfiguration
  {
    return this.routerConfig;
  }
}

export default RoutingService.getSingleton();
