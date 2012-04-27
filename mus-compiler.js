var compile = function (mexpr) {
  var mergeStacks = function(leftStack, rightStack){
    for (var i = 0; i < rightStack.length; i++) {
      leftStack.push(rightStack[i]) };
    return leftStack};
  var buildBundle = function(leftStack, rightStack, duration){
    mergeStacks(leftStack, rightStack)
    return {'stack': leftStack, 'dur': duration}}

  var states = {};
  states['note'] = function(mexpr, startTime){
    var convertPitch = function(charpitch){
      var tabl = {"c":0, "d":2, "e":4, "f":5, "g":7, "a":9, "b":11 }
      return tabl[charpitch[0]] + (charpitch[1]*12) + 12;}
    var note = {tag: mexpr.tag, pitch: convertPitch(mexpr.pitch), start: startTime, dur: mexpr.dur};
    return {'stack': [note], 'dur': mexpr.dur}}
  states['rest'] = function(mexpr, startTime){
    var note = {tag: mexpr.tag, start: startTime, dur: mexpr.dur};
    return {'stack': [note], 'dur': mexpr.dur}}
  states['seq'] = function(mexpr, startTime){
    var left = flatten(mexpr.left, startTime);
    var right = flatten(mexpr.right, startTime + left.dur);
    return buildBundle(left.stack, right.stack, left.dur + right.dur)}
  states['repeat'] = function(mexpr, startTime){
    var stack = [];
    var subl
    for (var i = 0; i < mexpr.count; i++) {
      sub = flatten(mexpr.section, startTime);
      startTime = startTime + sub.dur;
      stack = mergeStacks(stack, sub.stack);}
    return {'stack': stack, 'dur': mexpr.count * sub.dur}}
  states['par'] = function(mexpr, startTime){
    var left = flatten(mexpr.left, startTime);
    var right = flatten(mexpr.right, startTime);
    var length;
    if (left.dur > right.dur) {length = left.dur;} else {length = right.dur;}
    return buildBundle(left.stack, right.stack, length)}
  var flatten = function(mexpr, startTime){
    return states[mexpr.tag](mexpr, startTime)}
  return flatten(mexpr, 0).stack}