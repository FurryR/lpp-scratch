import { LppCompatibleRuntime, Thread, ThreadConstructor } from '../typing'

/**
 * Bind fn to thread. Fn will be called when the thread exits.
 * @param thread Thread object.
 * @param fn Dedicated function.
 */
export function bindThread(thread: Thread, fn: () => void) {
  // Call callback (if exists) when the thread is finished.
  let status = thread.status
  let alreadyCalled = false
  const threadConstructor = thread.constructor as ThreadConstructor
  Reflect.defineProperty(thread, 'status', {
    get: () => {
      return status
    },
    set: newStatus => {
      status = newStatus
      if (status === threadConstructor.STATUS_DONE) {
        if (!alreadyCalled) {
          alreadyCalled = true
          fn()
        }
      }
    }
  })
}
/**
 * Method for compiler to fix globalState.
 * @param runtime Runtime.
 * @param util Scratch util.
 * @param thread Thread instance.
 */
export function stepThread(
  runtime: LppCompatibleRuntime,
  util: VM.BlockUtility,
  thread: Thread
) {
  const callerThread = util.thread as Thread
  runtime.sequencer.stepThread(thread)
  // if (util && callerThread) util.thread = callerThread // restore interpreter context
  if (
    thread.isCompiled &&
    callerThread &&
    callerThread.isCompiled &&
    callerThread.generator
  ) {
    const orig = callerThread.generator
    callerThread.generator = {
      next: () => {}
    }
    runtime.sequencer.stepThread(callerThread) // restore compiler context (globalState)
    callerThread.generator = orig
  }
  util.thread = callerThread
}
