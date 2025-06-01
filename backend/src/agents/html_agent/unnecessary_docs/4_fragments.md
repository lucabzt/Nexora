# Fragments

Fragments are used to highlight or incrementally reveal individual elements on a slide. Every element with the class `fragment` will be stepped through before moving on to the next slide.

The default fragment style is to start out invisible and fade in. This style can be changed by appending a different class to the fragment.

```html
<p class="fragment">Fade in</p>
<p class="fragment fade-out">Fade out</p>
<p class="fragment highlight-red">Highlight red</p>
<p class="fragment fade-in-then-out">Fade in, then out</p>
<p class="fragment fade-up">Slide up while fading in</p>
```

| Name | Effect |
| --- | --- |
| fade-out | Start visible, fade out |
| fade-up | Slide up while fading in |
| fade-down | Slide down while fading in |
| fade-left | Slide left while fading in |
| fade-right | Slide right while fading in |
| fade-in-then-out | Fades in, then out on the next step |
| current-visible | Fades in, then out on the next step |
| fade-in-then-semi-out | Fades in, then to 50% on the next step |
| grow | Scale up |
| semi-fade-out | Fade out to 50% |
| shrink | Scale down |
| strike | Strike through |
| highlight-red | Turn text red |
| highlight-green | Turn text green |
| highlight-blue | Turn text blue |
| highlight-current-red | Turn text red, then back to original on next step |
| highlight-current-green | Turn text green, then back to original on next step |
| highlight-current-blue | Turn text blue, then back to original on next step |


## Fragment Order

By default fragments will be stepped through in the order that they appear in the DOM. This display order can be changed using the `data-fragment-index` attribute. Note that multiple elements can appear at the same index.

```html
<p class="fragment" data-fragment-index="3">Appears last</p>
<p class="fragment" data-fragment-index="1">Appears first</p>
<p class="fragment" data-fragment-index="2">Appears second</p>
```

Please do not overuse fragments, remember that the user needs to click through each fragment individually.
Only use if explicitely useful for educational goal