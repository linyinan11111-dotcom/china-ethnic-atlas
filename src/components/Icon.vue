<script setup lang="ts">
withDefaults(defineProps<{name:string;size?:number}>(),{size:20});
const paths:Record<string,string[]>={
 mountain:['M2 20 9 6l6 14','m12 20 5-10 5 10','m7 10 2 2 2-2'],
 map:['m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z','M9 3v15','M15 6v15'],
 chart:['M4 3v17h17','M8 16v-5','M13 16V7','M18 16V4'],
 book:['M12 6C8 3 4 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7 0-10 2Z','M12 6v15'],
 trend:['m3 17 6-6 4 4 8-10','M15 5h6v6'],
 clock:['M12 8v4l3 2','M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z'],
 info:['M12 11v5','M12 7h.01','M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z'],
 search:['M20 20l-5-5','M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z'],
 arrow:['M4 12h16','m14 6 6 6-6 6'],
 chevron:['m9 5 7 7-7 7'],
 pin:['M19 10c0 6-7 11-7 11S5 16 5 10a7 7 0 1 1 14 0Z','M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
 users:['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z','M22 21v-2a4 4 0 0 0-3-3.87','M16 3a4 4 0 0 1 0 8'],
 layers:['m12 2 10 6-10 6L2 8Z','m2 12 10 6 10-6','m2 16 10 6 10-6'],
 plus:['M12 5v14','M5 12h14'],minus:['M5 12h14'],
 reset:['M3 10a9 9 0 1 1 2 8','M3 3v7h7'],
 download:['M12 3v12','m7 10 5 5 5-5','M4 16v5h16v-5'],
 external:['M15 3h6v6','m10 14 11-11','M10 3H3v18h18v-7'],
 close:['m6 6 12 12','M6 18 18 6'],
 leaf:['M20 3C10 2 3 5 4 13s14 9 16-10Z','M5 20 16 9'],
 route:['M3 18h10a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h11','M6 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
 school:['m2 9 10-7 10 7','M4 9v12h16V9','M10 21v-7h4v7','M8 10h.01','M16 10h.01'],
 check:['m5 12 4 4L19 6'],
 globe:['M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z','M2 12h20','M12 2c6 5 6 15 0 20-6-5-6-15 0-20'],
 github:['M9 19c-5 2-5-2-7-2','M15 22v-4a4 4 0 0 0-1-3c4 0 8-2 8-6a5 5 0 0 0-1-3c1-2 0-4 0-4-2 0-3 1-4 2a14 14 0 0 0-6 0C10 3 8 2 6 2c0 0-1 2 0 4a5 5 0 0 0-1 3c0 4 4 6 8 6a4 4 0 0 0-1 3v4'],
};
</script>
<template><svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path v-for="(d,i) in (paths[name]??paths.info)" :key="i" :d="d" /></svg></template>
