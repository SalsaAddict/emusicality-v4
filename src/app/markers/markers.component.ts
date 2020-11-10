import { Component, Input } from '@angular/core';
import { Measure } from '../measure';
import { Measures } from '../measures';

@Component({
  selector: 'app-markers',
  templateUrl: './markers.component.html'
})
export class MarkersComponent {
  @Input() measures?: Measure[];
  @Input() measure?: Measure;
  @Input() beat?: number;
  format(measure: Measure) {
    let isActive = measure === this.measure!,
      icon = !isActive ? "fa-circle-o" : measure.warning ? "fa-exclamation-circle" : "fa-circle",
      animation = isActive ? "animate__animated animate__faster animate__heartBeat" : "",
      isLast = this.measures!.indexOf(measure!) === this.measures!.length - 1,
      margin = measure.warning && !isLast ? "mr-2" : "";
    return `text-${measure.context} ${animation} fa fa-fw fa-lg ${icon} my-0 ${margin}`.replace(/\s+/g, " ");
  }
}
