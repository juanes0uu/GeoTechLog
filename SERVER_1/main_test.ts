// main_test.ts

import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";

import { add } from "./main.ts"; 

Deno.test("add function test", function () {
    assertEquals(add(1, 2), 3); 

    assertEquals(add(-1, 5), 4);
    
    assertEquals(add(0, 10), 10);
});

