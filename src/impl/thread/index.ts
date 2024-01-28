import { LppCompatibleRuntime, Thread } from '../typing'
import { bindThread, stepThread } from './helper'
import { ImmediatePromise } from '../promise'

export class ThreadController {
  private static waitingThread: WeakMap<VM.Thread, ImmediatePromise<void>> =
    new WeakMap()
  create(
    topBlockId: string,
    target: VM.Target,
    options?: {
      stackClick?: boolean
      updateMonitor?: boolean
    }
  ): Thread {
    return this.runtime._pushThread(topBlockId, target, options)
  }
  wait(thread: Thread): ImmediatePromise<void> {
    const cache = ThreadController.waitingThread.get(thread)
    if (cache) {
      return cache
    }
    const v = new ImmediatePromise<void>(resolve => {
      bindThread(thread, resolve)
      stepThread(this.runtime, this.util, thread)
    })
    ThreadController.waitingThread.set(thread, v)
    return v
  }
  step(thread: Thread) {
    stepThread(this.runtime, this.util, thread)
  }
  constructor(
    private runtime: LppCompatibleRuntime,
    private util: VM.BlockUtility
  ) {}
}
