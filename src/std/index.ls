
export id = -> it

export log = -> console.log.apply console, &; &0

export min = Math.min

export max = Math.max

export floor = Math.floor

export round = Math.round

export sin = Math.sin

export cos = Math.cos

export tau = Math.PI * 2

export flip = (λ) -> (a, b) -> λ b, a

export delay = flip set-timeout

export keys = -> [ k for k, v of it ]

export div = (a, b) --> floor a / b

