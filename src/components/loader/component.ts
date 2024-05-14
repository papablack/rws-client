import { RWSView, RWSViewComponent } from '../../index';

@RWSView('the-loader')
class RWSLoader extends RWSViewComponent {
  
    connectedCallback(): void {
        super.connectedCallback();
    }
}

RWSLoader.defineComponent();

export { RWSLoader };