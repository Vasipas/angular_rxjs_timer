import { Component, OnDestroy } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { buffer, map, debounceTime, filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnDestroy {

  click$ = new Subject();
  start$ = new Subject();
  destroy$ = new Subject();
  seconds = 0
  inWaiting = false
  started = false

  doubleClick$ = this.click$.pipe(
    buffer(
      this.click$.pipe(debounceTime(500))
    ),
    map(list => {
      return list.length;
    }),
    filter(x => x === 2),
  )

  timer$ = interval(1000).pipe(
    takeUntil(this.start$),
    takeUntil(this.destroy$),
    takeUntil(this.doubleClick$)
  );

  start = () => {
    if(this.started === false) {
      if(this.inWaiting === false) {
        this.started = true
        this.start$.next(true)
        this.timer$.subscribe(data => {
          this.seconds = data
        });
      } else {
        this.inWaiting = false
        let timeOffset = this.seconds
        this.timer$.pipe(map(data => data+timeOffset)).subscribe(data => {
          this.seconds = data
        })
      }
    } else {
      this.started = false
      this.seconds = 0
      this.destroy$.next(true)
    }   
  }

  wait = () => {
    this.inWaiting = true
    this.click$.next(true)
  }

  reset = () => {
    if(this.started === false) return
    this.inWaiting = false
    this.start$.next(true)
    this.timer$.subscribe(data => {
      this.seconds = data
    });
  }

  formatedTime = () => {
    let minutes = Math.floor(this.seconds/60)
    let seconds = this.seconds - minutes*60
    return {
      minutes: minutes.toString().padStart(2, '0'), 
      seconds: seconds.toString().padStart(2, '0')}
  }

  startButtonLabel = () => {
    if(this.started) return 'Stop'
    else return 'Start'
  }

  ngOnDestroy = () => {
    this.destroy$.next(true);
  }
}
