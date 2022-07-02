/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, {
	createContext,
	ReactElement,
	useContext,
	useInsertionEffect,
} from "react";
import { navigate } from "../client-side-navigation/lib";
import { escapeJson } from "../../runtime/utils";

export interface RedirectProps {
	/** The URL to redirect to */
	href: string;
	/** Whether the redirect is permanent */
	permanent?: boolean;
	/** The status code to use (hes precedence over `permanent`) */
	status?: number;
}

// @ts-ignore
export const Redirect = import.meta.env.SSR
	? function Redirect(props: RedirectProps): ReactElement {
			const redirect = useContext(ResponseContext);

			redirect({
				redirect: true,
				status: props.status || (props.permanent ? 301 : 302),
				headers: { location: props.href },
			});

			// TODO: Document that if <Redirect /> is burried deep in a suspense boundary and JavaScript is disabled, it won't work.

			return (
				<>
					<script
						dangerouslySetInnerHTML={{
							__html: `window.location.href=${escapeJson(
								JSON.stringify(props.href),
							)};`,
						}}
					/>
				</>
			);
	  }
	: function Redirect(props: RedirectProps): ReactElement {
			useInsertionEffect(() => {
				navigate(props.href, { replace: true });
			});

			return null as any;
	  };

export interface ResponseHeadersProps {
	/** Status code */
	status?: number | ((currentStatus: number) => number);
	/** The headers to set */
	headers?: Record<string, string | string[]> | ((headers: Headers) => void);
	/**
	 * Time to hold the render stream before returning the response. Set to
	 * true to hold until the page is fully rendered, effectively disabling
	 * streaming.
	 */
	throttleRenderStream?: number | true;
}

// @ts-ignore
export const ResponseHeaders = import.meta.env.SSR
	? function ResponseHeaders(props: ResponseHeadersProps): ReactElement {
			const response = useContext(ResponseContext);

			response({
				status: props.status,
				headers: props.headers,
				throttleRenderStream: props.throttleRenderStream,
			});

			return <></>;
	  }
	: // eslint-disable-next-line @typescript-eslint/no-unused-vars
	  function ResponseHeaders(props: ResponseHeadersProps): ReactElement {
			return null as any;
	  };

export interface ResponseContextProps {
	redirect?: boolean;
	status?: number | ((currentStatus: number) => number);
	headers?: Record<string, string | string[]> | ((headers: Headers) => void);
	throttleRenderStream?: number | true;
}

export const ResponseContext = createContext<
	(props: ResponseContextProps) => void
>(() => undefined);
