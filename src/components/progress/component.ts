import { RWSView, RWSViewComponent, observable, attr } from '../../index';
import {
    nullableNumberConverter,
} from '@microsoft/fast-element';

@RWSView('rws-progress')
class RWSProgress extends RWSViewComponent {

    @attr({ converter: nullableNumberConverter })
    public value: number | null;
    protected valueChanged(): void {
        this.updatePercentComplete();
    }


    @attr({ converter: nullableNumberConverter })
    public min: number;
    protected minChanged(): void {
        if (this.$fastController.isConnected) {
            this.updatePercentComplete();
        }
    }

    
    @attr({ converter: nullableNumberConverter })
    public max: number;
    protected maxChanged(): void {
        if (this.$fastController.isConnected) {
            this.updatePercentComplete();
        }
    }

    
    @observable
    public percentComplete: number = 0;

    public connectedCallback(): void {
        super.connectedCallback();
        this.updatePercentComplete();
    }

    private updatePercentComplete(): void {
        const min: number = typeof this.min === 'number' ? this.min : 0;
        const max: number = typeof this.max === 'number' ? this.max : 100;
        const value: number = typeof this.value === 'number' ? this.value : 0;
        const range: number = max - min;

        this.percentComplete =
            range === 0 ? 0 : Math.fround(((value - min) / range) * 100);
    }
}

RWSProgress.defineComponent();

export { RWSProgress };