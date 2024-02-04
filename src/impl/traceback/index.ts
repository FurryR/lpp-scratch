/**
 * Blockly traceback implementation.
 */

import type { VM } from '../typing'
import { LppException } from '../../core'
import { BlocklyInstance } from '../blockly'
import * as Dialog from './dialog'
import type * as ScratchBlocks from 'blockly/core'
import { LppTraceback } from '../context'
import { Inspector } from './inspector'
let lastNotification: Notification | undefined
/**
 * Warn by notification.
 * @param param0 Config.
 */
function notificationAlert({
  title,
  body,
  tag,
  silent
}: {
  title: string
  body: string
  tag: string
  silent: boolean
}) {
  Notification.requestPermission().then(value => {
    if (value === 'granted') {
      if (lastNotification) {
        lastNotification.close()
        lastNotification = undefined
        setTimeout(() => notificationAlert({ title, body, tag, silent }))
      } else {
        lastNotification = new Notification(title, {
          body,
          tag,
          silent
        })
        lastNotification.addEventListener('close', () => {
          lastNotification = undefined
        })
      }
    }
  })
}
/**
 * Show visual traceback
 * @param svgRoot SVG element.
 */
export function showTraceback(svgRoot: SVGAElement) {
  let container = document.getElementById('tmpSVGContainer')
  const temp = svgRoot.outerHTML.replace(/&nbsp;/g, ' ')
  if (!container) {
    container = document.createElement('div')
    container.id = 'tmpSVGContainer'
    container.innerHTML =
      '<svg id="tmpSVG" xmlns="http://www.w3.org/2000/svg" xmlns:html="http://www.w3.org/1999/xhtml" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" class="blocklySvg"><style type="text/css" ><![CDATA[.blocklyDraggable{font-family: "Helvetica Neue", Helvetica, sans-serif;font-size: 12pt;font-weight: 500;}.blocklyText {fill: #fff;box-sizing: border-box;}.blocklyEditableText .blocklyText{fill: #000;}.blocklyDropdownText.blocklyText{fill: #fff;}]]></style><g id="tmpSVGContent"></g></svg>'
    document.body.appendChild(container)
  }
  const content = document.getElementById('tmpSVGContent')
  if (content && content instanceof SVGGElement) {
    content.innerHTML = temp
    content.children[0].setAttribute('transform', '')
    const shape = content.children[0].getAttribute('data-shapes') ?? '',
      shape_hat = shape.includes('hat'),
      ishat = 'hat' !== shape && shape_hat,
      bbox = content.getBBox()
    let length = shape_hat ? 18 : 0
    length = ishat ? 21 : length
    const width = Math.max(750, bbox.width + 1),
      height = bbox.height + length,
      svg = document.getElementById('tmpSVG')
    if (svg) {
      svg.setAttribute('width', width.toString())
      svg.setAttribute('height', height.toString())
      svg.setAttribute(
        'viewBox',
        `-1 ${shape_hat ? -length : 0} ${width} ${height}`
      )
      let html = svg.outerHTML
      html = (html = (html = (html = (html = html.replace(
        /"[\S]+?dropdown-arrow\.svg"/gm,
        '"data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMi43MSIgaGVpZ2h0PSI4Ljc5IiB2aWV3Qm94PSIwIDAgMTIuNzEgOC43OSI+PHRpdGxlPmRyb3Bkb3duLWFycm93PC90aXRsZT48ZyBvcGFjaXR5PSIwLjEiPjxwYXRoIGQ9Ik0xMi43MSwyLjQ0QTIuNDEsMi40MSwwLDAsMSwxMiw0LjE2TDguMDgsOC4wOGEyLjQ1LDIuNDUsMCwwLDEtMy40NSwwTDAuNzIsNC4xNkEyLjQyLDIuNDIsMCwwLDEsMCwyLjQ0LDIuNDgsMi40OCwwLDAsMSwuNzEuNzFDMSwwLjQ3LDEuNDMsMCw2LjM2LDBTMTEuNzUsMC40NiwxMiwuNzFBMi40NCwyLjQ0LDAsMCwxLDEyLjcxLDIuNDRaIiBmaWxsPSIjMjMxZjIwIi8+PC9nPjxwYXRoIGQ9Ik02LjM2LDcuNzlhMS40MywxLjQzLDAsMCwxLTEtLjQyTDEuNDIsMy40NWExLjQ0LDEuNDQsMCwwLDEsMC0yYzAuNTYtLjU2LDkuMzEtMC41Niw5Ljg3LDBhMS40NCwxLjQ0LDAsMCwxLDAsMkw3LjM3LDcuMzdBMS40MywxLjQzLDAsMCwxLDYuMzYsNy43OVoiIGZpbGw9IiNmZmYiLz48L3N2Zz4="'
      )).replace(
        /"[\S]+?green-flag\.svg"/gm,
        '"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIxLjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9ImdyZWVuZmxhZyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iMCAwIDI0IDI0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyNCAyNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM0NTk5M0Q7fQoJLnN0MXtmaWxsOiM0Q0JGNTY7fQo8L3N0eWxlPgo8dGl0bGU+Z3JlZW5mbGFnPC90aXRsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTIwLjgsMy43Yy0wLjQtMC4yLTAuOS0wLjEtMS4yLDAuMmMtMiwxLjYtNC44LDEuNi02LjgsMGMtMi4zLTEuOS01LjYtMi4zLTguMy0xVjIuNWMwLTAuNi0wLjUtMS0xLTEKCXMtMSwwLjQtMSwxdjE4LjhjMCwwLjUsMC41LDEsMSwxaDAuMWMwLjUsMCwxLTAuNSwxLTF2LTYuNGMxLTAuNywyLjEtMS4yLDMuNC0xLjNjMS4yLDAsMi40LDAuNCwzLjQsMS4yYzIuOSwyLjMsNywyLjMsOS44LDAKCWMwLjMtMC4yLDAuNC0wLjUsMC40LTAuOVY0LjdDMjEuNiw0LjIsMjEuMywzLjgsMjAuOCwzLjd6IE0yMC41LDEzLjlDMjAuNSwxMy45LDIwLjUsMTMuOSwyMC41LDEzLjlDMTgsMTYsMTQuNCwxNiwxMS45LDE0CgljLTEuMS0wLjktMi41LTEuNC00LTEuNGMtMS4yLDAuMS0yLjMsMC41LTMuNCwxLjFWNEM3LDIuNiwxMCwyLjksMTIuMiw0LjZjMi40LDEuOSw1LjcsMS45LDguMSwwYzAuMSwwLDAuMSwwLDAuMiwwCgljMCwwLDAuMSwwLjEsMC4xLDAuMUwyMC41LDEzLjl6Ii8+CjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0yMC42LDQuOGwtMC4xLDkuMWMwLDAsMCwwLjEsMCwwLjFjLTIuNSwyLTYuMSwyLTguNiwwYy0xLjEtMC45LTIuNS0xLjQtNC0xLjRjLTEuMiwwLjEtMi4zLDAuNS0zLjQsMS4xVjQKCUM3LDIuNiwxMCwyLjksMTIuMiw0LjZjMi40LDEuOSw1LjcsMS45LDguMSwwYzAuMSwwLDAuMSwwLDAuMiwwQzIwLjUsNC43LDIwLjYsNC43LDIwLjYsNC44eiIvPgo8L3N2Zz4K"'
      )).replace(
        /"[\S]+?repeat\.svg"/gm,
        '"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIxLjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9InJlcGVhdCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iMCAwIDI0IDI0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyNCAyNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNDRjhCMTc7fQoJLnN0MXtmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8dGl0bGU+cmVwZWF0PC90aXRsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTIzLjMsMTFjLTAuMywwLjYtMC45LDEtMS41LDFoLTEuNmMtMC4xLDEuMy0wLjUsMi41LTEuMSwzLjZjLTAuOSwxLjctMi4zLDMuMi00LjEsNC4xCgljLTEuNywwLjktMy42LDEuMi01LjUsMC45Yy0xLjgtMC4zLTMuNS0xLjEtNC45LTIuM2MtMC43LTAuNy0wLjctMS45LDAtMi42YzAuNi0wLjYsMS42LTAuNywyLjMtMC4ySDdjMC45LDAuNiwxLjksMC45LDIuOSwwLjkKCXMxLjktMC4zLDIuNy0wLjljMS4xLTAuOCwxLjgtMi4xLDEuOC0zLjVoLTEuNWMtMC45LDAtMS43LTAuNy0xLjctMS43YzAtMC40LDAuMi0wLjksMC41LTEuMmw0LjQtNC40YzAuNy0wLjYsMS43LTAuNiwyLjQsMEwyMyw5LjIKCUMyMy41LDkuNywyMy42LDEwLjQsMjMuMywxMXoiLz4KPHBhdGggY2xhc3M9InN0MSIgZD0iTTIxLjgsMTFoLTIuNmMwLDEuNS0wLjMsMi45LTEsNC4yYy0wLjgsMS42LTIuMSwyLjgtMy43LDMuNmMtMS41LDAuOC0zLjMsMS4xLTQuOSwwLjhjLTEuNi0wLjItMy4yLTEtNC40LTIuMQoJYy0wLjQtMC4zLTAuNC0wLjktMC4xLTEuMmMwLjMtMC40LDAuOS0wLjQsMS4yLTAuMWwwLDBjMSwwLjcsMi4yLDEuMSwzLjQsMS4xczIuMy0wLjMsMy4zLTFjMC45LTAuNiwxLjYtMS41LDItMi42CgljMC4zLTAuOSwwLjQtMS44LDAuMi0yLjhoLTIuNGMtMC40LDAtMC43LTAuMy0wLjctMC43YzAtMC4yLDAuMS0wLjMsMC4yLTAuNGw0LjQtNC40YzAuMy0wLjMsMC43LTAuMywwLjksMEwyMiw5LjgKCWMwLjMsMC4zLDAuNCwwLjYsMC4zLDAuOVMyMiwxMSwyMS44LDExeiIvPgo8L3N2Zz4K"'
      )).replace(
        /"[\S]+?rotate-left\.svg"/gm,
        '"data:image/svg+xml;base64,PHN2ZyBpZD0icm90YXRlLWNsb2Nrd2lzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojM2Q3OWNjO30uY2xzLTJ7ZmlsbDojZmZmO308L3N0eWxlPjwvZGVmcz48dGl0bGU+cm90YXRlLWNsb2Nrd2lzZTwvdGl0bGU+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMjAuMzQsMTguMjFhMTAuMjQsMTAuMjQsMCwwLDEtOC4xLDQuMjIsMi4yNiwyLjI2LDAsMCwxLS4xNi00LjUyaDBhNS41OCw1LjU4LDAsMCwwLDQuMjUtMi41Myw1LjA2LDUuMDYsMCwwLDAsLjU0LTQuNjJBNC4yNSw0LjI1LDAsMCwwLDE1LjU1LDlhNC4zMSw0LjMxLDAsMCwwLTItLjhBNC44Miw0LjgyLDAsMCwwLDEwLjQsOWwxLjEyLDEuNDFBMS41OSwxLjU5LDAsMCwxLDEwLjM2LDEzSDIuNjdhMS41NiwxLjU2LDAsMCwxLTEuMjYtLjYzQTEuNTQsMS41NCwwLDAsMSwxLjEzLDExTDIuODUsMy41N0ExLjU5LDEuNTksMCwwLDEsNC4zOCwyLjQsMS41NywxLjU3LDAsMCwxLDUuNjIsM0w2LjcsNC4zNWExMC42NiwxMC42NiwwLDAsMSw3LjcyLTEuNjhBOS44OCw5Ljg4LDAsMCwxLDE5LDQuODEsOS42MSw5LjYxLDAsMCwxLDIxLjgzLDksMTAuMDgsMTAuMDgsMCwwLDEsMjAuMzQsMTguMjFaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMTkuNTYsMTcuNjVhOS4yOSw5LjI5LDAsMCwxLTcuMzUsMy44MywxLjMxLDEuMzEsMCwwLDEtLjA4LTIuNjIsNi41Myw2LjUzLDAsMCwwLDUtMi45Miw2LjA1LDYuMDUsMCwwLDAsLjY3LTUuNTEsNS4zMiw1LjMyLDAsMCwwLTEuNjQtMi4xNiw1LjIxLDUuMjEsMCwwLDAtMi40OC0xQTUuODYsNS44NiwwLDAsMCw5LDguODRMMTAuNzQsMTFhLjU5LjU5LDAsMCwxLS40MywxSDIuN2EuNi42LDAsMCwxLS42LS43NUwzLjgxLDMuODNhLjU5LjU5LDAsMCwxLDEtLjIxbDEuNjcsMi4xYTkuNzEsOS43MSwwLDAsMSw3Ljc1LTIuMDcsOC44NCw4Ljg0LDAsMCwxLDQuMTIsMS45Miw4LjY4LDguNjgsMCwwLDEsMi41NCwzLjcyQTkuMTQsOS4xNCwwLDAsMSwxOS41NiwxNy42NVoiLz48L3N2Zz4="'
      )).replace(
        /"[\S]+?rotate-right\.svg"/gm,
        '"data:image/svg+xml;base64,PHN2ZyBpZD0icm90YXRlLWNvdW50ZXItY2xvY2t3aXNlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMzZDc5Y2M7fS5jbHMtMntmaWxsOiNmZmY7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5yb3RhdGUtY291bnRlci1jbG9ja3dpc2U8L3RpdGxlPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTIyLjY4LDEyLjJhMS42LDEuNiwwLDAsMS0xLjI3LjYzSDEzLjcyYTEuNTksMS41OSwwLDAsMS0xLjE2LTIuNThsMS4xMi0xLjQxYTQuODIsNC44MiwwLDAsMC0zLjE0LS43Nyw0LjMxLDQuMzEsMCwwLDAtMiwuOCw0LjI1LDQuMjUsMCwwLDAtMS4zNCwxLjczLDUuMDYsNS4wNiwwLDAsMCwuNTQsNC42MkE1LjU4LDUuNTgsMCwwLDAsMTIsMTcuNzRoMGEyLjI2LDIuMjYsMCwwLDEtLjE2LDQuNTJBMTAuMjUsMTAuMjUsMCwwLDEsMy43NCwxOCwxMC4xNCwxMC4xNCwwLDAsMSwyLjI1LDguNzgsOS43LDkuNywwLDAsMSw1LjA4LDQuNjQsOS45Miw5LjkyLDAsMCwxLDkuNjYsMi41YTEwLjY2LDEwLjY2LDAsMCwxLDcuNzIsMS42OGwxLjA4LTEuMzVhMS41NywxLjU3LDAsMCwxLDEuMjQtLjYsMS42LDEuNiwwLDAsMSwxLjU0LDEuMjFsMS43LDcuMzdBMS41NywxLjU3LDAsMCwxLDIyLjY4LDEyLjJaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjEuMzgsMTEuODNIMTMuNzdhLjU5LjU5LDAsMCwxLS40My0xbDEuNzUtMi4xOWE1LjksNS45LDAsMCwwLTQuNy0xLjU4LDUuMDcsNS4wNywwLDAsMC00LjExLDMuMTdBNiw2LDAsMCwwLDcsMTUuNzdhNi41MSw2LjUxLDAsMCwwLDUsMi45MiwxLjMxLDEuMzEsMCwwLDEtLjA4LDIuNjIsOS4zLDkuMywwLDAsMS03LjM1LTMuODJBOS4xNiw5LjE2LDAsMCwxLDMuMTcsOS4xMiw4LjUxLDguNTEsMCwwLDEsNS43MSw1LjQsOC43Niw4Ljc2LDAsMCwxLDkuODIsMy40OGE5LjcxLDkuNzEsMCwwLDEsNy43NSwyLjA3bDEuNjctMi4xYS41OS41OSwwLDAsMSwxLC4yMUwyMiwxMS4wOEEuNTkuNTksMCwwLDEsMjEuMzgsMTEuODNaIi8+PC9zdmc+"'
      )
      const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        html
      )}`
      document.body.removeChild(container)
      console.log(
        '%c ',
        `font-size: 1px; padding-right: ${width}px; padding-bottom: ${height}px; background-image: url('${svgUrl}'); background-repeat: no-repeat; background-size: contain; color: transparent;`
      )
    }
  }
}

/**
 * Warn syntax errors with specified ID.
 * @param Blockly Scratch Blockly instance.
 * @param vm VM instance.
 * @param error Error ID.
 * @param id Block ID.
 * @param target Target ID.
 */
export function warnError(
  Blockly: BlocklyInstance | undefined,
  vm: VM,
  formatMessage: (id: string) => string,
  error: string,
  id: string,
  target: string
) {
  if (Blockly) {
    if (
      vm.runtime.getEditingTarget()?.id !== target &&
      vm.runtime.getTargetById(target)
    ) {
      vm.setEditingTarget(target)
    }
    const workspace = Blockly.getMainWorkspace() as ScratchBlocks.WorkspaceSvg
    workspace.centerOnBlock(id, true)
    let original = ''
    const div: HTMLDivElement | undefined = Dialog.show(
      Blockly,
      id,
      [
        Dialog.IconGroup([
          Dialog.HelpIcon(
            formatMessage('lpp.tooltip.button.help.more'),
            formatMessage('lpp.tooltip.button.help.less'),
            () => {
              if (div) {
                const v = div.getElementsByClassName('lpp-hint')[0]
                if (v) {
                  original = v.textContent ?? ''
                  v.textContent = `💡 ${formatMessage(`lpp.error.${error}.detail`)}`
                }
              }
            },
            () => {
              if (div) {
                const v = div.getElementsByClassName('lpp-hint')[0]
                if (v) {
                  v.textContent = original
                }
              }
            }
          ),
          Dialog.CloseIcon(Blockly, formatMessage('lpp.tooltip.button.close'))
        ]),
        Dialog.Title(`ℹ️ ${formatMessage(`lpp.error.${error}.summary`)}`),
        document.createElement('br'),
        Dialog.Text(`🔍 ${formatMessage('lpp.error.hint')}`, 'lpp-hint')
      ],
      'left'
    )
    if (!div) {
      notificationAlert({
        title: `❌ ${formatMessage(`lpp.error.${error}.summary`)}`,
        body: `📌 ${formatMessage(
          'lpp.error.position'
        )} ${id}\n🔍 ${formatMessage('lpp.error.hint')}`,
        tag: 'lppError',
        silent: false
      })
    }
  } else {
    notificationAlert({
      title: `❌ ${formatMessage('lpp.error.releaseMode.summary')}`,
      body: `ℹ️ ${formatMessage(
        'lpp.error.releaseMode.detail'
      )}\n🔍 ${formatMessage('lpp.error.hint')}`,
      tag: 'lppError',
      silent: true
    })
  }
  console.groupCollapsed(`❌ ${formatMessage(`lpp.error.${error}.summary`)}`)
  if (Blockly) {
    console.log(`💡 ${formatMessage(`lpp.error.${error}.detail`)}`)
    const block = Blockly.getMainWorkspace()?.getBlockById(id) as unknown as
      | { getSvgRoot: () => SVGAElement }
      | undefined
    const svgRoot = block?.getSvgRoot()
    console.groupCollapsed(`📌 ${formatMessage('lpp.error.position')} ${id}`)
    if (svgRoot) {
      showTraceback(svgRoot)
      console.log(svgRoot)
    } else {
      console.log(`❓ ${formatMessage('lpp.error.blockNotFound')}`)
    }
    console.groupEnd()
  } else {
    console.log(`ℹ️ ${formatMessage('lpp.error.releaseMode.detail')}`)
    console.log(`📌 ${formatMessage('lpp.error.position')} ${id}`)
  }
  console.groupEnd()
}
/**
 * Warn exception.
 * @param Blockly Blockly global instance.
 * @param vm VM instance.
 * @param formatMessage Function to format message.
 * @param exception Exception instance.
 */
export function warnException(
  Blockly: BlocklyInstance | undefined,
  vm: VM,
  formatMessage: (id: string) => string,
  exception: LppException
) {
  if (Blockly) {
    const getTraceback = (): (Node | string)[] => {
      const text: (Node | string)[] = []
      text.push(
        `💡 ${formatMessage(`lpp.error.uncaughtException.detail`)}`,
        document.createElement('br'),
        document.createElement('br')
      )
      text.push(
        `🤔 ${formatMessage('lpp.error.uncaughtException.exception')}`,
        document.createElement('br'),
        Inspector(Blockly, vm, formatMessage, exception.value), // TODO: Better design
        document.createElement('br')
      )
      text.push(`👾 ${formatMessage('lpp.error.uncaughtException.traceback')}`)
      const list = document.createElement('ul')
      list.classList.add('lpp-list')
      for (const [index, value] of exception.stack.entries()) {
        const li = document.createElement('li')
        const traceback = document.createElement('span')
        traceback.classList.add('lpp-code')
        if (Blockly && value instanceof LppTraceback.Block) {
          if (vm.runtime.getTargetById(value.target)) {
            const workspace =
              Blockly.getMainWorkspace() as ScratchBlocks.WorkspaceSvg
            traceback.classList.add('lpp-traceback-stack-enabled')
            traceback.title = formatMessage(
              'lpp.tooltip.button.scrollToBlockEnabled'
            )
            traceback.addEventListener('click', () => {
              const box =
                Blockly.DropDownDiv.getContentDiv().getElementsByClassName(
                  'valueReportBox'
                )[0]
              vm.setEditingTarget(value.target)
              workspace.centerOnBlock(value.block, true)
              Blockly.DropDownDiv.hideWithoutAnimation()
              Blockly.DropDownDiv.clearContent()
              Blockly.DropDownDiv.getContentDiv().append(box)
              Blockly.DropDownDiv.showPositionedByBlock(
                workspace as unknown as ScratchBlocks.Field<unknown>,
                workspace.getBlockById(value.block) as ScratchBlocks.BlockSvg
              )
            })
          } else {
            traceback.classList.add('lpp-traceback-stack-disabled')
            traceback.title = formatMessage(
              'lpp.tooltip.button.scrollToBlockDisabled'
            )
          }
        } else if (value instanceof LppTraceback.NativeFn) {
          traceback.title = formatMessage('lpp.tooltip.button.nativeFn')
        }
        traceback.textContent = value.toString()
        li.append(`📌 ${index} ➡️ `, traceback)
        list.append(li)
      }
      text.push(list)
      return text
    }
    let flag = false
    for (const stack of exception.stack.toReversed()) {
      if (
        stack instanceof LppTraceback.Block &&
        vm.runtime.getTargetById(stack.target)
      ) {
        vm.setEditingTarget(stack.target)
        const workspace =
          Blockly.getMainWorkspace() as ScratchBlocks.WorkspaceSvg
        workspace.centerOnBlock(stack.block, true)
        let original = ''
        const div: HTMLDivElement | undefined = Dialog.show(
          Blockly,
          stack.block,
          [
            Dialog.IconGroup([
              Dialog.HelpIcon(
                formatMessage('lpp.tooltip.button.help.more'),
                formatMessage('lpp.tooltip.button.help.less'),
                () => {
                  if (div) {
                    const v = div.getElementsByClassName('lpp-hint')[0]
                    if (v) {
                      original = v.textContent ?? ''
                      while (v.firstChild) v.removeChild(v.firstChild)
                      v.append(...getTraceback())
                    }
                  }
                },
                () => {
                  if (div) {
                    const v = div.getElementsByClassName('lpp-hint')[0]
                    if (v) {
                      v.textContent = original
                    }
                  }
                }
              ),
              Dialog.CloseIcon(
                Blockly,
                formatMessage('lpp.tooltip.button.close')
              )
            ]),
            Dialog.Title(
              `ℹ️ ${formatMessage(`lpp.error.uncaughtException.summary`)}`
            ),
            document.createElement('br'),
            Dialog.Text(`🔍 ${formatMessage('lpp.error.hint')}`, 'lpp-hint')
          ],
          'left'
        )
        flag = !!div
        break
      }
    }
    if (!flag)
      notificationAlert({
        title: `❌ ${formatMessage('lpp.error.uncaughtException.summary')}`,
        body: `💡 ${formatMessage(
          'lpp.error.uncaughtException.detail'
        )}\n🔍 ${formatMessage('lpp.error.hint')}`,
        tag: 'lppError',
        silent: false
      })
  } else {
    notificationAlert({
      title: `❌ ${formatMessage('lpp.error.releaseMode.summary')}`,
      body: `ℹ️ ${formatMessage(
        'lpp.error.releaseMode.detail'
      )}\n🔍 ${formatMessage('lpp.error.hint')}`,
      tag: 'lppError',
      silent: true
    })
  }
  console.groupCollapsed(
    `❌ ${formatMessage('lpp.error.uncaughtException.summary')}`
  )
  if (Blockly)
    console.log(`💡 ${formatMessage('lpp.error.uncaughtException.detail')}`)
  else console.log(`ℹ️ ${formatMessage('lpp.error.releaseMode.detail')}`)
  console.log(
    `🤔 ${formatMessage('lpp.error.uncaughtException.exception')}`,
    exception.value
  )
  console.groupCollapsed(
    `👾 ${formatMessage('lpp.error.uncaughtException.traceback')}`
  )
  for (const [idx, value] of exception.stack.entries()) {
    if (Blockly) {
      if (value instanceof LppTraceback.Block) {
        const block = Blockly.getMainWorkspace()?.getBlockById(
          value.block
        ) as unknown as { getSvgRoot: () => SVGAElement } | undefined
        const svgRoot = block?.getSvgRoot()
        console.groupCollapsed(`📌 ${idx + 1} ➡️`, value.block)
        if (svgRoot) {
          showTraceback(svgRoot)
          console.log(svgRoot)
        } else {
          console.log(`❓ ${formatMessage('lpp.error.blockNotFound')}`)
        }
        if (value.context)
          console.log(`🛠️ ${formatMessage('lpp.error.context')}`, value.context)
        console.groupEnd()
      } else if (value instanceof LppTraceback.NativeFn) {
        console.groupCollapsed(`📌 ${idx + 1} ➡️`, value.fn)
        console.log(`🛠️ ${formatMessage('lpp.error.self')}`, value.self)
        console.log(`🛠️ ${formatMessage('lpp.error.arguments')}`, value.args)
        console.groupEnd()
      } else {
        console.log(`📌 ${idx + 1} ➡️`, value.toString())
      }
    } else {
      console.log(`📌 ${idx + 1} ➡️`, value.toString())
    }
  }
  console.groupEnd()
  console.groupEnd()
}
if (Dialog.globalStyle) {
  Dialog.globalStyle.textContent += `
.lpp-list {
  list-style-type: disc;
  padding: 0;
  margin-left: 19.5px;
  margin-top: 4px;
  margin-bottom: 0;
}
.lpp-list li {
  line-height: 100%;
  margin-top: 0;
  margin-bottom: 4px;
}
.lpp-code {
  font-family: "Source Code Pro", "Fira Code", "DejaVu Sans Mono", "Cascadia Code", "Jetbrains Mono", "Lucida Console", Consolas, monospace;
}
.lpp-traceback-stack-enabled {
  transition: color 0.25s ease-out;
}
.lpp-traceback-stack-disabled {
  transition: color 0.25s ease-out;
}
.lpp-traceback-stack-enabled:hover {
  cursor: pointer;
  color: gray;
  user-select: text;
}
.lpp-traceback-stack-disabled:hover {
  cursor: not-allowed;
  color: red;
  user-select: text;
}
`
}
export { Dialog, Inspector }
