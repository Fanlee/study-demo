/*
 * @Author: lihuan
 * @Date: 2023-08-02 10:07:48
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-02 16:03:15
 * @Description: 
 */
type Factory<T = boolean> = T | number | string
const tmp1: Factory<{}> = {}

type ResStatus<ResCode extends number=10000> = ResCode extends 10000 | 10001 | 10002 ? 'success' : 'failure'
type Res1 = ResStatus
const tmp2: Res1 = 'success'

type Conditional<Type, Condition, TruthyResult, FalsyResult> = Type extends Condition ? TruthyResult : FalsyResult
type Result1 = Conditional<'name', string, 'success', 'failure'>
type Result2 = Conditional<'age', number, 'success', 'failure'>

type ProcessInput<Input, SecondInput extends Input, ThirdInput extends Input> = number
type processInput1 = ProcessInput<100, 100, 100>

interface IRes1<TData = unknown> {
  code: number;
  error?: string;
  data: TData;
} 

interface IRes2 { 
  name: string;
  homepage: string;
  avatar?: string;
}

function fetchUserProfile(): Promise<IRes1<IRes2>> { 
  return Promise.resolve({
    code: 200,
    data: {
      name: 'zhangsan',
      homepage: ''
    }
  })
}

function fn1<T>(input: T):T { 
  return input
}
const tmp3 = "linbudu"
let tmp4 = 30

fn1(tmp3)
fn1(tmp4)

function fn2<T, U>([start, end]: [T, U]): [U, T] { 
  return [end, start]
}
const tmp5 = fn2(['zhangsan', 30])
const tmp6 = fn2([null, 30])
const tmp7 = fn2([{ name: 'zhangsan' }, {}])

class Cls1<TElementType> { 
  private _list: TElementType[]
  constructor(initial: TElementType[]) { 
    this._list = initial
  }
  enqueue<TType extends TElementType>(ele: TType): TElementType[] {
    this._list.push(ele);
    return this._list
  }
  enqueueWithUnknownType<TType>(ele: TType): (TElementType |  TType)[] {
    return [...this._list, ele]
  }
  dequeue():TElementType[] { 
    this._list.shift();
    return this._list;
  }
}

class Cat {
  eat() { }
}

class Dog {
  eat() { }
}

function feedCat(cat: Cat) { }

feedCat(new Dog())

type USD = number;
type CNY = number;

const CNYCount: CNY = 200;
const USDCount: USD = 200;

function addCNY(source: CNY, input: CNY) {
  return source + input;
}

addCNY(CNYCount, USDCount)

type Result16 = {} extends object ? 1 : 2;
type Result18 = object extends {} ? 1 : 2;

type Result17 = object extends Object ? 1 : 2;
type Result20 = Object extends object ? 1 : 2;

type Result19 = Object extends {} ? 1 : 2;
type Result21 = {} extends Object ? 1 : 2;

type Result24 = any extends Object ? 1 : 2; // 1 | 2
type Result25 = unknown extends Object ? 1 : 2; // 2

type Func = (...args: any[]) => any;
type FunctionConditionType<T extends Func> = T extends (
  ...args: any[]
) => string
  ? 'A string return func!'
  : 'A non-string return func!';
type FunctionCondition = FunctionConditionType<() => string>
const tmp8: FunctionCondition = 'A string return func!'

type PromiseValue<T> = T extends Promise<infer V> ? PromiseValue<V> : T
type PromiseValueResult = PromiseValue<Promise<Promise<number>>>

type ExtractStartAndEnd<T extends any[]> = T extends [infer Start, ...any[], infer End] ? [End, Start] : T
type ArrayItemTypeResult1 = ExtractStartAndEnd<[1, number, string]>
type IsNever<T> = T extends never ? 1 : 2;
type IsNeverRes1 = IsNever<any>

type Tmp9<T> = T extends string ? 1 : 2;
type Tmp9Res = Tmp9<never>; 

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

interface IRes3 { 
  name: string;
  age?: number;
  readonly sex: string
}

type TRes1 = Partial<IRes3>
type TRes2 = Required<IRes3>
type TRes3 = Readonly<IRes3>
type TRes4 = Mutable<IRes3>


const res1: TRes1 = {

}

const res2: TRes2 = {
  name: 'lisi',
  age: 30,
  sex: '女'
}

const res3: TRes3 = {
  name: '王二',
  sex: '女'
}

const res4: TRes4 = {
  name: '王二',
  sex: '女'
}
res4.sex = '张飞'

type TRes5 = Record<string, unknown>

const fn3 = (input: TRes5) => { 
  
}

declare let func: (raw: number) => (input: string) => any;

// raw → number
func = (raw) => {
  // input → string
  return (input) => {};
};