const domainName = "spirit-wing.info";
const terminalUser = `user@${domainName} ~ %`

function Terminal(props) {
    return (
        <div className="border-2 border-green-500  m-4 w-1/2 translate-x-1/2 fixed z-20 mockup-code bg-base-200 text-base-500">
            <pre className="pl-4 text-2xl text-green-500">
                <code>user@spiritwing.io:~ </code>
                <code>{props.command}</code>
                <code className="animate-blink-inline-0.5s"> </code>
            </pre>
        </div>
    )
}

export default Terminal;