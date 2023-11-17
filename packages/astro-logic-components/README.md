
# Logic components for 👩‍🚀Astro

### Astro components for `If`, `For`, and `Foreach`

I am not a big fan of ternary operators in JSX, and I believe the fact that `.map` works as a loop is _super hacky_.

```astro
---
import { If, For, Foreach } from '@marmadilemanteater/astro-logic-components'

interface Person {
  name: string,
  age: number
}

const someFreakingList: Person[] = [
  {
    name: 'Bob',
    age: 25
  },
  {
    name: 'Alice',
    age: 26
  }
]
---
<If condition={Math.random() > 0.5}>
  What do you mean? Goku could totally beat Kaiba in a fight~! 
  <span slot="else">
    What are you talking about? Kaiba wouldn't even have to be anywhere near Goku. He could just nuke the entire planet Goku was standing on with his Blue Eyes White 🚀nukes <em>(brought to you by KaibaCorp)</em>.
  </span>
</If>

<h1>Oh, hey, lookie there~! That's the English alphabet. What is that doing there?</h1>
<For 
  start={0}
  endCondition={(i: number) => i < 26}
  change={(i: number) => i + 1}
>
  {(i: number) => <>
    {String.fromCharCode(i + 65)}
  </>}
</For>

<Foreach
  list={someFreakingList}
>
  {({ name, age }: Person) => {
    <p>Name: <strong>{name}</strong></p>
    <p>Age: <em>{age}</em></p>
  }}
</Foreach>
```
