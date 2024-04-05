import { RWSView, RWSViewComponent } from '@rws-framework/client';

@RWSView('the-loader')
class RWSLoader extends RWSViewComponent {
  
    connectedCallback(): void {
        super.connectedCallback();
    }
}

RWSLoader.defineComponent();

export { RWSLoader };