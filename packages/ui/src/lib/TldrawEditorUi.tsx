import { ToastProvider } from '@radix-ui/react-toast'
import { useApp } from '@tldraw/editor'
import classNames from 'classnames'
import React, { ReactNode } from 'react'
import { useValue } from 'signia-react'
import {
	TldrawEditorUiContextProvider,
	TldrawEditorUiContextProviderProps,
} from './TldrawEditorUiContextProvider'
import { BackToContent } from './components/BackToContent'
import { DebugPanel } from './components/DebugPanel'
import { Dialogs } from './components/Dialogs'
import { FollowingIndicator } from './components/FollowingIndicator'
import { HelpMenu } from './components/HelpMenu'
import { MenuZone } from './components/MenuZone'
import { NavigationZone } from './components/NavigationZone/NavigationZone'
import { ExitPenMode } from './components/PenModeToggle'
import { StopFollowing } from './components/StopFollowing'
import { StylePanel } from './components/StylePanel/StylePanel'
import { ToastViewport, Toasts } from './components/Toasts'
import { Toolbar } from './components/Toolbar/Toolbar'
import { Button } from './components/primitives/Button'
import { useActions } from './hooks/useActions'
import { useAppEvents } from './hooks/useAppEvents'
import { useBreakpoint } from './hooks/useBreakpoint'
import { useNativeClipboardEvents } from './hooks/useClipboardEvents'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useTranslation } from './hooks/useTranslation/useTranslation'

/**
 * @public
 */
export const TldrawEditorUi = React.memo(function TldrawEditorUi({
	shareZone,
	renderDebugMenuItems,
	children,
	hideUi,
	...rest
}: {
	shareZone?: ReactNode
	renderDebugMenuItems?: () => React.ReactNode
	children?: ReactNode
	/** Whether to hide the interface and only display the canvas. */
	hideUi?: boolean
} & TldrawEditorUiContextProviderProps) {
	return (
		<TldrawEditorUiContextProvider {...rest}>
			<TldrawEditorUiInner
				hideUi={hideUi}
				shareZone={shareZone}
				renderDebugMenuItems={renderDebugMenuItems}
			>
				{children}
			</TldrawEditorUiInner>
		</TldrawEditorUiContextProvider>
	)
})

type TldrawEditorUiContentProps = {
	hideUi?: boolean
	shareZone?: ReactNode
	renderDebugMenuItems?: () => React.ReactNode
}

const TldrawEditorUiInner = React.memo(function TldrawEditorUiInner({
	children,
	hideUi,
	...rest
}: TldrawEditorUiContentProps & { children: ReactNode }) {
	// const isLoaded = usePreloadIcons()

	// if (!isLoaded) {
	// 	return <LoadingScreen>Loading assets...</LoadingScreen>
	// }

	// The hideUi prop should prevent the UI from mounting.
	// If we ever need want the UI to mount and preserve state, then
	// we should change this behavior and hide the UI via CSS instead.

	return (
		<>
			{children}
			{hideUi ? null : <TldrawEditorUiContent {...rest} />}
		</>
	)
})

/** @public */
export const TldrawEditorUiContent = React.memo(function TldrawEditorUi({
	shareZone,
	renderDebugMenuItems,
}: TldrawEditorUiContentProps) {
	const app = useApp()
	const msg = useTranslation()
	const breakpoint = useBreakpoint()
	const isReadonlyMode = useValue('isReadOnlyMode', () => app.isReadOnly, [app])
	const isFocusMode = useValue('focus', () => app.instanceState.isFocusMode, [app])
	const isDebugMode = useValue('debug', () => app.instanceState.isDebugMode, [app])

	useKeyboardShortcuts()
	useNativeClipboardEvents()
	useAppEvents()

	const { 'toggle-focus-mode': toggleFocus } = useActions()

	return (
		<ToastProvider>
			<main
				data-tldraw-area="active-drawing"
				className={classNames('tlui-layout', {
					'tlui-layout__mobile': breakpoint < 5,
				})}
			>
				{isFocusMode ? (
					<div className="tlui-layout__top">
						<Button
							className="tlui-focus-button"
							title={`${msg('focus-mode.toggle-focus-mode')}`}
							icon="dot"
							onClick={() => toggleFocus.onSelect('menu')}
						/>
					</div>
				) : (
					<>
						<div className="tlui-layout__top">
							<div className="tlui-layout__top__left">
								<MenuZone />
								<div className="tlui-helper-buttons">
									<ExitPenMode />
									<BackToContent />
									<StopFollowing />
								</div>
							</div>
							<div className="tlui-layout__top__right">
								{shareZone && (
									<div className="tlui-share-zone" draggable={false}>
										{shareZone}
									</div>
								)}
								{breakpoint >= 5 && !isReadonlyMode && (
									<div className="tlui-style-panel__wrapper">
										<StylePanel />
									</div>
								)}
							</div>
						</div>
						<div className="tlui-layout__bottom">
							<div className="tlui-layout__bottom__main">
								<NavigationZone />
								<Toolbar />
								{breakpoint >= 4 && <HelpMenu />}
							</div>
							{isDebugMode && <DebugPanel renderDebugMenuItems={renderDebugMenuItems ?? null} />}
						</div>
					</>
				)}
				<Toasts />
				<Dialogs />
				<ToastViewport />
				<FollowingIndicator />
			</main>
		</ToastProvider>
	)
})