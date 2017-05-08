import { p, h, div, makeDOMDriver, DOMSource, VNode } from '@cycle/dom';
import { timeDriver, TimeSource } from '@cycle/time';
import { run } from '@cycle/run';
import xs, { Stream } from 'xstream';

type Sources = {
  DOM: DOMSource;
  Time: TimeSource;
}

type Sinks = {
  DOM: Stream<VNode>;
}

// Here's the gist of it
//
// First of all, there is this thing people call "intelligence"
// There is this myth that it's a simple one dimensional thing
// A myth you see come up in IQ tests
//
// We have this line:
//
// ---------------|-------------------
//
// It's a simple system. If you're smart, you're higher up. If you're dumb, you're lower down.
//
// Aside from the fact this model has roots in prevent black people from voting
//
// It's just plain innaccurate.
//
// IQ tests measure a very specific axis of intelligence.
//
// In reality, there are many dimensions of intelligence.
//
// To name a few:
//
//  * book smarts
//  * emotional intelligence
//  * creativity
//  * planning and logistics
//  * street smarts
//
// These form a different picture of intelligence
//
//  <-- insert radar graph -->
//
// So what does this have to do with hiring?
//
// Hiring people who fit your culture is a bad idea
//
// Let's look at what happens if we hire on a combination of skill and culture fit
//
// All of these theoretical candidates have an equal amount of skill,
// but we can see that we end up with a team with a very homogenous skill set
//
// What if we hired for what people brought to our culture?
//
// Here we can see that over time we end up with a much more balanced and diverse team, equipped to solve harder problems
//
// When you're considering a possible hire, don't ask yourself if they fit the culture
//
// Ask yourself what they bring to it.
//
// If they bring a skillset that empowers your team and an attitude to match, hire them!
//
// If they bring bigotry or negativity, that's probably not what you're looking for.
//
function renderIQLine (state: IntelligenceState): VNode {
  const viewBox = `0 -400 1000 500`;

  const segmentCount = 100;
  const segments = new Array(segmentCount).fill(0);
  const segmentWidth = 1000 / segmentCount;


  console.log(state.distribution);;
  return (
    h('svg', {attrs: {viewBox}}, [
      h('line', {
        attrs: {
          x1: 0,
          y1: 0,
          x2: 1000,
          y2: 0,
          'stroke-width': 2,
          stroke: 'skyblue'
        }
      }),
      h('line', {
        attrs: {
          x1: 500,
          y1: 20,
          x2: 500,
          y2: -20,
          'stroke-width': 2,
          stroke: 'skyblue'
        }
      }),

      ...segments.map((segment, index) => {
        const start = (index / segmentCount) * 5 - 2.5;

        const height = state.distribution.filter(a => a > start && a < start + 0.25).length;

        return (
          h('rect', {
            attrs: {
              x: index * segmentWidth,
              y: -(height / 10),
              width: segmentWidth,
              fill: 'palegreen',
              height: height / 10
            }
          })
        )
      })
    ])
  );
}

function view (state: IntelligenceState) {
  return (
    div('.iq-line', [
      p(`
 First of all, there is this thing people call "intelligence"
 There is this myth that it's a simple one dimensional thing
 A myth you see come up in IQ tests

 We have this line:

`),
      renderIQLine(state)
    ])
  )
}

function normalRandom (): number {
    var u = 1 - Math.random(); // Subtraction to flip [0, 1) to (0, 1].
    var v = 1 - Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function randomIqDeviation () {
}

type IntelligenceState = {
  distribution: number[]
}

type Reducer<T> = (s: T) => T;

function IntelligenceLine(sources: Sources): Sinks {
  const initialState : IntelligenceState = {
    distribution: []
  };

  const addIqNode$ = sources.Time.periodic(10).take(300).map(() => {
    return function (state: IntelligenceState): IntelligenceState {
      let i = 100;
      while (i > 0) {
        state.distribution.push(normalRandom());

        i--;
      }

      return state;
    }
  });

  const reducer$ = xs.merge(
    addIqNode$
  );

  const state$ = reducer$.fold((state: IntelligenceState, reducer: Reducer<IntelligenceState>): IntelligenceState => reducer(state), initialState);

  return {
    DOM: state$.map(view)
  }
}

function main (sources: Sources): Sinks {
  return {
    DOM: IntelligenceLine(sources).DOM
  }
}


const drivers = {
  DOM: makeDOMDriver('.app'),
  Time: timeDriver
}

run(main, drivers);
